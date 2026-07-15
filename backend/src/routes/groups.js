const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { calculateLedger, simplifyDebts } = require('../services/debt');
const { parseReceipt } = require('../services/gemini');

// 0. Get all Groups for User
router.get('/groups', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    // Lazy archive groups at zero balance for more than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.run(`
      UPDATE groups 
      SET status = 'archived' 
      WHERE zeroBalanceSince IS NOT NULL 
        AND zeroBalanceSince < ? 
        AND status = 'active'
    `, [sevenDaysAgo]);

    const groups = await db.all(`
      SELECT g.* FROM groups g
      JOIN group_members gm ON g.id = gm.groupId
      WHERE gm.userId = ? AND g.status = 'active'
    `, [userId]);

    // Add memberIds to each group object
    for (const g of groups) {
      const members = await db.all('SELECT userId FROM group_members WHERE groupId = ?', [g.id]);
      g.memberIds = members.map(m => m.userId);
    }

    return res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// 1. Create a Listahan (Group)
router.post('/groups', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const hostId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  const groupId = uuidv4();
  const now = new Date().toISOString();

  try {
    // Run transaction
    try {
      await db.exec('BEGIN;');
      await db.run(`
        INSERT INTO groups (id, name, hostId, createdAt)
        VALUES (?, ?, ?, ?)
      `, [groupId, name, hostId, now]);
      
      await db.run(`
        INSERT INTO group_members (groupId, userId, joinedAt)
        VALUES (?, ?, ?)
      `, [groupId, hostId, now]);
      
      await db.exec('COMMIT;');
    } catch (txErr) {
      await db.exec('ROLLBACK;');
      throw txErr;
    }

    const group = await db.get('SELECT * FROM groups WHERE id = ?', [groupId]);
    return res.json(group);
  } catch (err) {
    console.error('Error creating group:', err);
    return res.status(500).json({ error: 'Failed to create group' });
  }
});

// 2. Generate/Get Join Link for Group
router.post('/groups/:id/join-link', authMiddleware, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    // Verify group exists and user is a member
    const member = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId]);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    let group = await db.get('SELECT * FROM groups WHERE id = ?', [groupId]);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.joinSlug) {
      const slug = uuidv4().slice(0, 8); // simple short unique slug
      await db.run('UPDATE groups SET joinSlug = ? WHERE id = ?', [slug, groupId]);
      group.joinSlug = slug;
    }

    return res.json({
      id: uuidv4(),
      groupId: group.id,
      slug: group.joinSlug,
      url: `https://hati.ph/join/${group.joinSlug}`,
      createdAt: group.createdAt
    });
  } catch (err) {
    console.error('Error creating join link:', err);
    return res.status(500).json({ error: 'Failed to generate join link' });
  }
});

// 3. Resolve slug and join group
router.get('/join/:slug', authMiddleware, async (req, res) => {
  const slug = req.params.slug;
  const userId = req.user.id;
  const now = new Date().toISOString();
  console.log(`[debug] /join/:slug slug=${slug} userId=${userId}`);

  try {
    const group = await db.get('SELECT * FROM groups WHERE joinSlug = ?', [slug]);
    console.log(`[debug] /join/:slug group=${JSON.stringify(group)}`);
    if (!group) {
      return res.status(404).json({ error: 'Invite link not found or expired' });
    }

    // Check if user is already a member
    const existing = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [group.id, userId]);
    console.log(`[debug] /join/:slug existing_member=${JSON.stringify(existing)}`);
    if (!existing) {
      await db.run('INSERT INTO group_members (groupId, userId, joinedAt) VALUES (?, ?, ?)', [group.id, userId, now]);
      console.log(`[debug] /join/:slug member inserted`);
      
      // If group was archived, check if joining breaks zero balance or keep active
      if (group.status === 'archived') {
        await db.run("UPDATE groups SET status = 'active', zeroBalanceSince = NULL WHERE id = ?", [group.id]);
        group.status = 'active';
        group.zeroBalanceSince = null;
      }
    }

    // Return group and ledger
    console.log(`[debug] /join/:slug calculating ledger...`);
    const ledgerBalances = await calculateLedger(group.id);
    console.log(`[debug] /join/:slug ledgerBalances=${JSON.stringify(ledgerBalances)}`);
    const simplifiedDebts = simplifyDebts(ledgerBalances);
    console.log(`[debug] /join/:slug simplifiedDebts=${JSON.stringify(simplifiedDebts)}`);

    return res.json({
      group,
      ledger: {
        balances: ledgerBalances,
        debts: simplifiedDebts
      }
    });
  } catch (err) {
    console.error('Error joining group:', err);
    return res.status(500).json({ error: 'Failed to join group' });
  }
});

// 4. Post Expense
router.post('/groups/:id/expenses', authMiddleware, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const { description, amount, currency, category, paidBy, splitType, splitDetails } = req.body;

  if (!description || !amount || !category || !paidBy) {
    return res.status(400).json({ error: 'Missing required expense fields' });
  }

  try {
    // Verify membership
    const member = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId]);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    // Extract mentions client-side (passed in mentions array if present, otherwise parse @mentions client-side as requested)
    // For convenience we accept an explicit mentions array, or parse the description for @mentions
    let mentions = req.body.mentions || [];
    if (mentions.length === 0) {
      // client-side parsing of @mentions is standard, but we fallback to extracting matching user handles from the DB if needed
      // Matches @[Name]
      const matches = description.match(/@(\w+)/g) || [];
      const cleanNames = matches.map(m => m.replace('@', ''));
      
      for (const name of cleanNames) {
        const matchedUser = await db.get('SELECT id FROM users WHERE displayName LIKE ?', [`%${name}%`]);
        if (matchedUser) {
          mentions.push(matchedUser.id);
        }
      }
    }

    // Save split details JSON
    let splitDetailsObj = splitDetails || {};
    // "Decision on @mention → split logic: mentioned users are added to splitDetails.participantIds (for equal split) automatically, in addition to whoever paidBy is."
    if (splitType === 'equal' || !splitType) {
      let participantIds = splitDetailsObj.participantIds;
      
      if (!participantIds || participantIds.length === 0) {
        if (mentions.length > 0) {
          participantIds = [paidBy];
          mentions.forEach(mId => {
            if (!participantIds.includes(mId)) {
              participantIds.push(mId);
            }
          });
        } else {
          // Default to all group members
          const groupMembers = await db.all('SELECT userId FROM group_members WHERE groupId = ?', [groupId]);
          participantIds = groupMembers.map(m => m.userId);
        }
      } else {
        // Ensure paidBy is in participants
        if (!participantIds.includes(paidBy)) {
          participantIds.push(paidBy);
        }
        // Ensure mentions are in participants
        mentions.forEach(mId => {
          if (!participantIds.includes(mId)) {
            participantIds.push(mId);
          }
        });
      }
      
      splitDetailsObj.participantIds = participantIds;
    }

    const expenseId = uuidv4();
    const now = new Date().toISOString();

    await db.run(`
      INSERT INTO expenses (id, groupId, description, mentions, amount, currency, category, paidBy, splitType, splitDetails, source, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      expenseId,
      groupId,
      description,
      JSON.stringify(mentions),
      amount,
      currency || 'PHP',
      category,
      paidBy,
      splitType || 'equal',
      JSON.stringify(splitDetailsObj),
      'manual_description',
      now
    ]);

    // If group status was zero-balance, reset zeroBalanceSince
    await db.run("UPDATE groups SET zeroBalanceSince = NULL WHERE id = ?", [groupId]);

    const expense = await db.get('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    expense.mentions = JSON.parse(expense.mentions);
    expense.splitDetails = JSON.parse(expense.splitDetails);

    return res.json(expense);
  } catch (err) {
    console.error('Error logging expense:', err);
    return res.status(500).json({ error: 'Failed to log expense' });
  }
});

// 4.1. Scan Receipt/Invoice via Gemini AI
router.post('/groups/:id/expenses/scan', authMiddleware, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64 payload' });
  }

  try {
    // Verify membership
    const member = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId]);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    const parsedData = await parseReceipt(imageBase64, mimeType);
    return res.json(parsedData);
  } catch (err) {
    console.error('Error in receipt scan endpoint:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to scan receipt' });
  }
});

// 5. Get Group Ledger
router.get('/groups/:id/ledger', authMiddleware, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    // Verify membership
    const member = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId]);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    const balances = await calculateLedger(groupId);
    const debts = simplifyDebts(balances);

    // Verify if net balance is all zero to update zeroBalanceSince
    const allZero = Object.values(balances).every(b => Math.abs(b) < 1);
    const group = await db.get('SELECT zeroBalanceSince FROM groups WHERE id = ?', [groupId]);

    if (allZero && group && !group.zeroBalanceSince) {
      const now = new Date().toISOString();
      await db.run('UPDATE groups SET zeroBalanceSince = ? WHERE id = ?', [now, groupId]);
    } else if (!allZero && group && group.zeroBalanceSince) {
      await db.run('UPDATE groups SET zeroBalanceSince = NULL WHERE id = ?', [groupId]);
    }

    return res.json({
      balances,
      debts
    });
  } catch (err) {
    console.error('Error fetching ledger:', err);
    return res.status(500).json({ error: 'Failed to calculate ledger' });
  }
});

// 6. Nudge a User (Rate-limited to 1 per user pair per 24 hours)
router.post('/groups/:id/nudge', authMiddleware, async (req, res) => {
  const groupId = req.params.id;
  const fromUserId = req.user.id;
  const { toUserId } = req.body;

  if (!toUserId) {
    return res.status(400).json({ error: 'Missing toUserId' });
  }

  try {
    // Verify both are in the group
    const fromMember = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, fromUserId]);
    const toMember = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, toUserId]);

    if (!fromMember || !toMember) {
      return res.status(403).json({ error: 'Access denied: Users are not members of this group' });
    }

    // Enforce 24 hour rate limit
    const lastNudge = await db.get(`
      SELECT sentAt FROM nudges 
      WHERE groupId = ? AND fromUserId = ? AND toUserId = ?
      ORDER BY sentAt DESC LIMIT 1
    `, [groupId, fromUserId, toUserId]);

    if (lastNudge) {
      const timeDiff = Date.now() - new Date(lastNudge.sentAt).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        return res.status(429).json({ error: 'Rate limit exceeded: You can only nudge the same roommate once every 24 hours.' });
      }
    }

    const nudgeId = uuidv4();
    const now = new Date().toISOString();

    await db.run(`
      INSERT INTO nudges (id, groupId, fromUserId, toUserId, sentAt, acknowledged)
      VALUES (?, ?, ?, ?, ?, 0)
    `, [nudgeId, groupId, fromUserId, toUserId, now]);

    const nudge = await db.get('SELECT * FROM nudges WHERE id = ?', [nudgeId]);
    return res.json(nudge);
  } catch (err) {
    console.error('Error executing nudge:', err);
    return res.status(500).json({ error: 'Failed to send nudge' });
  }
});

// 7. Get members of a Group
router.get('/groups/:id/members', authMiddleware, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const member = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId]);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    const members = await db.all(`
      SELECT u.id, u.displayName, u.photoUrl, u.phone, u.email, u.walletAddress FROM users u
      JOIN group_members gm ON u.id = gm.userId
      WHERE gm.groupId = ?
    `, [groupId]);

    return res.json(members);
  } catch (err) {
    console.error('Error fetching group members:', err);
    return res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

// 8. Get expenses for a Group
router.get('/groups/:id/expenses', authMiddleware, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const member = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId]);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    const expenses = await db.all('SELECT * FROM expenses WHERE groupId = ? ORDER BY createdAt DESC', [groupId]);
    expenses.forEach(e => {
      e.mentions = JSON.parse(e.mentions || '[]');
      e.splitDetails = JSON.parse(e.splitDetails || '{}');
    });

    return res.json(expenses);
  } catch (err) {
    console.error('Error fetching group expenses:', err);
    return res.status(500).json({ error: 'Failed to fetch group expenses' });
  }
});

// 9. Get settlements for a Group
router.get('/groups/:id/settlements', authMiddleware, async (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    const member = await db.get('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?', [groupId, userId]);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    const settlements = await db.all('SELECT * FROM settlements WHERE groupId = ?', [groupId]);
    for (const s of settlements) {
      const confirmations = await db.all('SELECT toUserId, confirmedAt FROM confirmations WHERE settlementId = ?', [s.id]);
      s.confirmations = confirmations;
    }

    return res.json(settlements);
  } catch (err) {
    console.error('Error fetching group settlements:', err);
    return res.status(500).json({ error: 'Failed to fetch group settlements' });
  }
});

module.exports = router;
