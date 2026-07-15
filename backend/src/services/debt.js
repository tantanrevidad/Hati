const db = require('../db/database');

/**
 * Calculates the net balances for all members of a group.
 * netBalance = (total paid by user) - (total owed by user)
 * Positive balance: User is owed money.
 * Negative balance: User owes money.
 */
async function calculateLedger(groupId) {
  // 1. Fetch group members
  const members = await db.all('SELECT userId FROM group_members WHERE groupId = ?', [groupId]);
  if (members.length === 0) {
    throw new Error('Group not found or has no members');
  }

  const netBalances = {};
  members.forEach(m => {
    netBalances[m.userId] = 0;
  });

  // 2. Fetch all expenses for the group
  const expenses = await db.all('SELECT * FROM expenses WHERE groupId = ?', [groupId]);
  
  expenses.forEach(exp => {
    const amount = exp.amount;
    const paidBy = exp.paidBy;

    // If the payer is no longer in the group, we still track it in the ledger if they are in the database.
    if (netBalances[paidBy] === undefined) {
      netBalances[paidBy] = 0;
    }

    // Credit the payer
    netBalances[paidBy] += amount;

    // Determine participants and splits
    let splitDetails = {};
    try {
      splitDetails = JSON.parse(exp.splitDetails || '{}');
    } catch (e) {
      splitDetails = {};
    }

    let participantIds = splitDetails.participantIds;
    if (!participantIds || participantIds.length === 0) {
      // Default to all group members
      participantIds = Object.keys(netBalances);
    }

    // Debit the participants
    if (exp.splitType === 'equal') {
      const share = Math.floor(amount / participantIds.length);
      const remainder = amount - (share * participantIds.length);

      participantIds.forEach((pId, idx) => {
        if (netBalances[pId] === undefined) {
          netBalances[pId] = 0;
        }
        netBalances[pId] -= share;
        
        // Distribute remainder to the first participant to avoid cent loss
        if (idx === 0) {
          netBalances[pId] -= remainder;
        }
      });
    } else if (exp.splitType === 'custom' && splitDetails.shares) {
      // shares is a map: { userId: amount }
      Object.keys(splitDetails.shares).forEach(pId => {
        const share = splitDetails.shares[pId];
        if (netBalances[pId] === undefined) {
          netBalances[pId] = 0;
        }
        netBalances[pId] -= share;
      });
    } else {
      // Fallback to equal split
      const share = Math.floor(amount / participantIds.length);
      const remainder = amount - (share * participantIds.length);

      participantIds.forEach((pId, idx) => {
        if (netBalances[pId] === undefined) {
          netBalances[pId] = 0;
        }
        netBalances[pId] -= share;
        if (idx === 0) {
          netBalances[pId] -= remainder;
        }
      });
    }
  });

  // 3. Fetch all confirmed settlements
  const settlements = await db.all(`
    SELECT s.id, s.fromUserId, c.toUserId, c.amount 
    FROM settlements s
    JOIN confirmations c ON s.id = c.settlementId
    WHERE s.groupId = ? AND s.status = 'confirmed'
  `, [groupId]);

  settlements.forEach(settle => {
    const fromUser = settle.fromUserId;
    const toUser = settle.toUserId;
    const amount = settle.amount;

    if (netBalances[fromUser] === undefined) netBalances[fromUser] = 0;
    if (netBalances[toUser] === undefined) netBalances[toUser] = 0;

    // The sender's debt is settled (so their net balance increases towards 0)
    netBalances[fromUser] += amount;
    // The receiver got paid (so their credit decreases towards 0)
    netBalances[toUser] -= amount;
  });

  return netBalances;
}

/**
 * Simplifies a set of net balances to output the minimum number of transactions.
 * Uses a greedy matchmaking approach.
 * balances: { [userId]: amount }
 * Returns: Array of { fromUserId, toUserId, amount }
 */
function simplifyDebts(balances) {
  const debtors = [];
  const creditors = [];

  Object.keys(balances).forEach(userId => {
    const bal = balances[userId];
    if (bal < 0) {
      debtors.push({ id: userId, balance: bal });
    } else if (bal > 0) {
      creditors.push({ id: userId, balance: bal });
    }
  });

  const transactions = [];

  // Greedily match debtors and creditors
  while (debtors.length > 0 && creditors.length > 0) {
    // Sort debtors ascending (most negative first)
    debtors.sort((a, b) => a.balance - b.balance);
    // Sort creditors descending (most positive first)
    creditors.sort((a, b) => b.balance - a.balance);

    const debtor = debtors[0];
    const creditor = creditors[0];

    const amount = Math.min(-debtor.balance, creditor.balance);

    if (amount > 0) {
      transactions.push({
        fromUserId: debtor.id,
        toUserId: creditor.id,
        amount: amount
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    // Filter out settled participants (use tolerance for floating point safety)
    if (Math.abs(debtor.balance) < 1) {
      debtors.shift();
    }
    if (Math.abs(creditor.balance) < 1) {
      creditors.shift();
    }
  }

  return transactions;
}

module.exports = {
  calculateLedger,
  simplifyDebts
};
