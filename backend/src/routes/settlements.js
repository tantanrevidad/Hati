const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { calculateLedger, simplifyDebts } = require('../services/debt');
const { createCustodialWallet, submitStellarPayment } = require('../services/stellar');

// 1. Initiate a Settlement
router.post('/settlements', authMiddleware, async (req, res) => {
  const { groupId, fromUserId, amount, method, toUserIds } = req.body;
  const callerId = req.user.id;

  if (!groupId || !fromUserId || !amount || !method || !toUserIds || toUserIds.length === 0) {
    return res.status(400).json({ error: 'Missing required settlement fields' });
  }

  // Verify caller matches fromUserId (only self-settle allowed)
  if (callerId !== fromUserId) {
    return res.status(403).json({ error: 'Access denied: You can only settle your own debts' });
  }

  try {
    // 1. Verify membership
    const members = db.prepare('SELECT userId FROM group_members WHERE groupId = ?').all(groupId);
    const memberIds = members.map(m => m.userId);

    if (!memberIds.includes(fromUserId)) {
      return res.status(400).json({ error: 'Sender is not a member of this group' });
    }

    for (const toId of toUserIds) {
      if (!memberIds.includes(toId)) {
        return res.status(400).json({ error: `Recipient ${toId} is not a member of this group` });
      }
    }

    // 2. Compute outstanding debts to distribute amount proportionally
    const balances = calculateLedger(groupId);
    const debts = simplifyDebts(balances);

    // Find what fromUserId owes to each of the toUserIds
    const relevantDebts = debts.filter(
      d => d.fromUserId === fromUserId && toUserIds.includes(d.toUserId)
    );

    const totalOwed = relevantDebts.reduce((sum, d) => sum + d.amount, 0);

    if (totalOwed === 0) {
      return res.status(400).json({ error: 'No outstanding debts found to settle with these users' });
    }

    const settlementId = uuidv4();
    const now = new Date().toISOString();
    let initialStatus = 'pending';

    // Calculate share per creditor
    const creditorShares = [];
    let allocatedAmount = 0;

    relevantDebts.forEach((debt, idx) => {
      let share = 0;
      if (idx === relevantDebts.length - 1) {
        share = amount - allocatedAmount; // give remainder to last
      } else {
        share = Math.floor(amount * (debt.amount / totalOwed));
      }
      allocatedAmount += share;

      creditorShares.push({
        toUserId: debt.toUserId,
        amount: share
      });
    });

    // Handle payment routing based on method
    if (method === 'qrph') {
      // QRPH is immediately confirmed in mock Phase 1
      initialStatus = 'confirmed';
    } else if (method === 'stellar') {
      initialStatus = 'pending'; // will set to confirmed if payment succeeds
    } else if (method === 'cash') {
      initialStatus = 'awaiting_confirmation';
    } else {
      return res.status(400).json({ error: 'Invalid settlement method' });
    }

    // Create the settlement record
    db.prepare(`
      INSERT INTO settlements (id, groupId, fromUserId, method, amount, status, initiatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(settlementId, groupId, fromUserId, method, amount, initialStatus, now);

    // Create confirmations list
    const insertConfirm = db.prepare(`
      INSERT INTO confirmations (id, settlementId, toUserId, amount, confirmedAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    const confirmations = [];

    // If QRPH, they are auto-confirmed
    creditorShares.forEach(share => {
      const confirmId = uuidv4();
      const confirmedAtVal = method === 'qrph' ? now : null;
      insertConfirm.run(confirmId, settlementId, share.toUserId, share.amount, confirmedAtVal);

      confirmations.push({
        id: confirmId,
        toUserId: share.toUserId,
        amount: share.amount,
        confirmedAt: confirmedAtVal
      });
    });

    const settlement = db.prepare('SELECT * FROM settlements WHERE id = ?').get(settlementId);
    settlement.confirmations = confirmations;

    // If Stellar, execute on-chain payment synchronously
    if (method === 'stellar') {
      try {
        console.log(`Executing Stellar settlement for ${fromUserId}...`);
        
        // 1. Ensure sender has a wallet
        await createCustodialWallet(fromUserId);
        const sender = db.prepare('SELECT walletSecret FROM users WHERE id = ?').get(fromUserId);

        // We will process payments to all creditors sequentially on-chain
        let txHashes = [];

        for (const share of confirmations) {
          // Ensure recipient has a wallet
          await createCustodialWallet(share.toUserId);
          const recipient = db.prepare('SELECT walletAddress FROM users WHERE id = ?').get(share.toUserId);

          console.log(`Sending Stellar payment of ${share.amount} centavos on-chain...`);
          // Trigger payment
          const hash = await submitStellarPayment(
            sender.walletSecret,
            recipient.walletAddress,
            share.amount
          );

          // Update confirmation as confirmed
          db.prepare('UPDATE confirmations SET confirmedAt = ? WHERE id = ?').run(now, share.id);
          share.confirmedAt = now;
          txHashes.push(hash);
        }

        // Set settlement status to confirmed
        const mainHash = txHashes.join(',');
        db.prepare('UPDATE settlements SET status = ?, stellarTxHash = ? WHERE id = ?').run(
          'confirmed',
          mainHash,
          settlementId
        );

        settlement.status = 'confirmed';
        settlement.stellarTxHash = mainHash;
        console.log('Stellar settlement successful. Tx Hashes:', mainHash);
      } catch (stErr) {
        console.error('Stellar transaction failed:', stErr);
        db.prepare('UPDATE settlements SET status = ? WHERE id = ?').run('failed', settlementId);
        settlement.status = 'failed';
        return res.status(502).json({ error: 'Stellar transaction failed', details: stErr.message, settlement });
      }
    }

    return res.json(settlement);
  } catch (err) {
    console.error('Error initiating settlement:', err);
    return res.status(500).json({ error: 'Failed to initiate settlement' });
  }
});

// 2. Confirm Cash Settlement (Creditor approves)
router.post('/settlements/:id/confirm', authMiddleware, (req, res) => {
  const settlementId = req.params.id;
  const toUserId = req.user.id; // user who is receiving the cash must confirm

  try {
    // Check if confirmation exists for this user and settlement
    const confirmRow = db.prepare(`
      SELECT id, confirmedAt FROM confirmations 
      WHERE settlementId = ? AND toUserId = ?
    `).get(settlementId, toUserId);

    if (!confirmRow) {
      return res.status(404).json({ error: 'No pending confirmation found for your user in this settlement' });
    }

    if (confirmRow.confirmedAt) {
      return res.status(400).json({ error: 'Payment already confirmed' });
    }

    const now = new Date().toISOString();
    // Update confirmation
    db.prepare('UPDATE confirmations SET confirmedAt = ? WHERE id = ?').run(now, confirmRow.id);

    // Check if ALL confirmations are now filled for this settlement
    const allConfirms = db.prepare('SELECT confirmedAt FROM confirmations WHERE settlementId = ?').all(settlementId);
    const allDone = allConfirms.every(c => c.confirmedAt !== null);

    if (allDone) {
      db.prepare("UPDATE settlements SET status = 'confirmed' WHERE id = ?").run(settlementId);
    }

    // Load full updated settlement details
    const settlement = db.prepare('SELECT * FROM settlements WHERE id = ?').get(settlementId);
    settlement.confirmations = db.prepare('SELECT * FROM confirmations WHERE settlementId = ?').all(settlementId);

    return res.json(settlement);
  } catch (err) {
    console.error('Error confirming cash settlement:', err);
    return res.status(500).json({ error: 'Failed to confirm settlement' });
  }
});

module.exports = router;
