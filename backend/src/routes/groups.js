const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { calculateLedger, simplifyDebts } = require('../services/debt');

// 1. Create a Listahan (Group)
router.post('/groups', authMiddleware, (req, res) => {
  const { name } = req.body;
  const hostId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  const groupId = uuidv4();
  const now = new Date().toISOString();

  try {
    const insertGroup = db.prepare(`
      INSERT INTO groups (id, name, hostId, createdAt)
      VALUES (?, ?, ?, ?)
    `);
    const insertMember = db.prepare(`
      INSERT INTO group_members (groupId, userId, joinedAt)
      VALUES (?, ?, ?)
    `);

    // Run transaction
    try {
      db.exec('BEGIN TRANSACTION;');
      insertGroup.run(groupId, name, hostId, now);
      insertMember.run(groupId, hostId, now);
      db.exec('COMMIT;');
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    return res.json(group);
  } catch (err) {
    console.error('Error creating group:', err);
    return res.status(500).json({ error: 'Failed to create group' });
  }
});

// 2. Generate/Get Join Link for Group
router.post('/groups/:id/join-link', authMiddleware, (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    // Verify group exists and user is a member
    const member = db.prepare('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?').get(groupId, userId);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    let group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.joinSlug) {
      const slug = uuidv4().slice(0, 8); // simple short unique slug
      db.prepare('UPDATE groups SET joinSlug = ? WHERE id = ?').run(slug, groupId);
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
router.get('/join/:slug', authMiddleware, (req, res) => {
  const slug = req.params.slug;
  const userId = req.user.id;
  const now = new Date().toISOString();
  console.log(`[debug] /join/:slug slug=${slug} userId=${userId}`);

  try {
    const group = db.prepare('SELECT * FROM groups WHERE joinSlug = ?').get(slug);
    console.log(`[debug] /join/:slug group=${JSON.stringify(group)}`);
    if (!group) {
      return res.status(404).json({ error: 'Invite link not found or expired' });
    }

    // Check if user is already a member
    const existing = db.prepare('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?').get(group.id, userId);
    console.log(`[debug] /join/:slug existing_member=${JSON.stringify(existing)}`);
    if (!existing) {
      db.prepare('INSERT INTO group_members (groupId, userId, joinedAt) VALUES (?, ?, ?)').run(group.id, userId, now);
      console.log(`[debug] /join/:slug member inserted`);
      
      // If group was archived, check if joining breaks zero balance or keep active
      if (group.status === 'archived') {
        db.prepare("UPDATE groups SET status = 'active', zeroBalanceSince = NULL WHERE id = ?").run(group.id);
        group.status = 'active';
        group.zeroBalanceSince = null;
      }
    }

    // Return group and ledger
    console.log(`[debug] /join/:slug calculating ledger...`);
    const ledgerBalances = calculateLedger(group.id);
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
router.post('/groups/:id/expenses', authMiddleware, (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  const { description, amount, currency, category, paidBy, splitType, splitDetails } = req.body;

  if (!description || !amount || !category || !paidBy) {
    return res.status(400).json({ error: 'Missing required expense fields' });
  }

  try {
    // Verify membership
    const member = db.prepare('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?').get(groupId, userId);
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
      
      cleanNames.forEach(name => {
        const matchedUser = db.prepare('SELECT id FROM users WHERE displayName LIKE ?').get(`%${name}%`);
        if (matchedUser) {
          mentions.push(matchedUser.id);
        }
      });
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
          const groupMembers = db.prepare('SELECT userId FROM group_members WHERE groupId = ?').all(groupId);
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

    const insert = db.prepare(`
      INSERT INTO expenses (id, groupId, description, mentions, amount, currency, category, paidBy, splitType, splitDetails, source, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
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
    );

    // If group status was zero-balance, reset zeroBalanceSince
    db.prepare("UPDATE groups SET zeroBalanceSince = NULL WHERE id = ?").run(groupId);

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(expenseId);
    expense.mentions = JSON.parse(expense.mentions);
    expense.splitDetails = JSON.parse(expense.splitDetails);

    return res.json(expense);
  } catch (err) {
    console.error('Error logging expense:', err);
    return res.status(500).json({ error: 'Failed to log expense' });
  }
});

// 5. Get Group Ledger
router.get('/groups/:id/ledger', authMiddleware, (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  try {
    // Verify membership
    const member = db.prepare('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?').get(groupId, userId);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    const balances = calculateLedger(groupId);
    const debts = simplifyDebts(balances);

    // Verify if net balance is all zero to update zeroBalanceSince
    const allZero = Object.values(balances).every(b => Math.abs(b) < 1);
    const group = db.prepare('SELECT zeroBalanceSince FROM groups WHERE id = ?').get(groupId);

    if (allZero && group && !group.zeroBalanceSince) {
      const now = new Date().toISOString();
      db.prepare('UPDATE groups SET zeroBalanceSince = ? WHERE id = ?').run(now, groupId);
    } else if (!allZero && group && group.zeroBalanceSince) {
      db.prepare('UPDATE groups SET zeroBalanceSince = NULL WHERE id = ?').run(groupId);
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
router.post('/groups/:id/nudge', authMiddleware, (req, res) => {
  const groupId = req.params.id;
  const fromUserId = req.user.id;
  const { toUserId } = req.body;

  if (!toUserId) {
    return res.status(400).json({ error: 'Missing toUserId' });
  }

  try {
    // Verify both are in the group
    const fromMember = db.prepare('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?').get(groupId, fromUserId);
    const toMember = db.prepare('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?').get(groupId, toUserId);

    if (!fromMember || !toMember) {
      return res.status(403).json({ error: 'Access denied: Users are not members of this group' });
    }

    // Enforce 24 hour rate limit
    const lastNudge = db.prepare(`
      SELECT sentAt FROM nudges 
      WHERE groupId = ? AND fromUserId = ? AND toUserId = ?
      ORDER BY sentAt DESC LIMIT 1
    `).get(groupId, fromUserId, toUserId);

    if (lastNudge) {
      const timeDiff = Date.now() - new Date(lastNudge.sentAt).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        return res.status(429).json({ error: 'Rate limit exceeded: You can only nudge the same roommate once every 24 hours.' });
      }
    }

    const nudgeId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO nudges (id, groupId, fromUserId, toUserId, sentAt, acknowledged)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(nudgeId, groupId, fromUserId, toUserId, now);

    const nudge = db.prepare('SELECT * FROM nudges WHERE id = ?').get(nudgeId);
    return res.json(nudge);
  } catch (err) {
    console.error('Error executing nudge:', err);
    return res.status(500).json({ error: 'Failed to send nudge' });
  }
});

// GET /groups - Fetch all groups the authenticated user belongs to
router.get('/groups', authMiddleware, (req, res) => {
  const userId = req.user.id;
  try {
    const userGroups = db.prepare(`
      SELECT g.* FROM groups g
      JOIN group_members gm ON g.id = gm.groupId
      WHERE gm.userId = ?
    `).all(userId);

    const groupsWithMembers = userGroups.map(group => {
      const members = db.prepare(`
        SELECT u.id, u.displayName, u.photoUrl FROM users u
        JOIN group_members gm ON u.id = gm.userId
        WHERE gm.groupId = ?
      `).all(group.id);

      // Compute user's net balance in the group (convert centavos to pesos on client)
      let netBalance = 0;
      try {
        const balances = calculateLedger(group.id);
        netBalance = balances[userId] || 0;
      } catch (ledgerErr) {
        console.error(`Ledger calculation error for group ${group.id}:`, ledgerErr.message);
      }

      return {
        ...group,
        members,
        netBalance
      };
    });

    return res.json(groupsWithMembers);
  } catch (err) {
    console.error('Error fetching groups:', err);
    return res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// GET /groups/:id - Fetch details of a specific group and its members
router.get('/groups/:id', authMiddleware, (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  try {
    const member = db.prepare('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?').get(groupId, userId);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const members = db.prepare(`
      SELECT u.id, u.displayName, u.photoUrl FROM users u
      JOIN group_members gm ON u.id = gm.userId
      WHERE gm.groupId = ?
    `).all(groupId);

    return res.json({
      ...group,
      members
    });
  } catch (err) {
    console.error('Error fetching group details:', err);
    return res.status(500).json({ error: 'Failed to fetch group details' });
  }
});

// GET /groups/:id/activities - Chronological list of combined expenses and settlements
router.get('/groups/:id/activities', authMiddleware, (req, res) => {
  const groupId = req.params.id;
  const userId = req.user.id;
  try {
    const member = db.prepare('SELECT 1 FROM group_members WHERE groupId = ? AND userId = ?').get(groupId, userId);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: Not a group member' });
    }

    // 1. Fetch expenses
    const expenses = db.prepare(`
      SELECT e.*, u.displayName as paidByName FROM expenses e
      JOIN users u ON e.paidBy = u.id
      WHERE e.groupId = ?
    `).all(groupId);

    // 2. Fetch settlements
    const settlements = db.prepare(`
      SELECT s.*, u.displayName as fromUserName FROM settlements s
      JOIN users u ON s.fromUserId = u.id
      WHERE s.groupId = ?
    `).all(groupId);

    // 3. Fetch confirmations for settlements in this group
    const confirmations = db.prepare(`
      SELECT c.*, u.displayName as toUserName FROM confirmations c
      JOIN users u ON c.toUserId = u.id
      WHERE c.settlementId IN (SELECT id FROM settlements WHERE groupId = ?)
    `).all(groupId);

    const groupMembers = db.prepare(`
      SELECT u.id, u.displayName FROM users u
      JOIN group_members gm ON u.id = gm.userId
      WHERE gm.groupId = ?
    `).all(groupId);

    const memberMap = {};
    groupMembers.forEach(m => {
      memberMap[m.id] = m.displayName;
    });

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formattedExpenses = expenses.map(exp => {
      let splitDetails = {};
      try {
        splitDetails = JSON.parse(exp.splitDetails || '{}');
      } catch (e) {
        splitDetails = {};
      }

      let participantIds = splitDetails.participantIds || [];
      if (participantIds.length === 0) {
        participantIds = groupMembers.map(m => m.id);
      }

      const splitAmount = Math.round(exp.amount / participantIds.length);
      const splits = [];

      participantIds.forEach(pId => {
        if (pId !== exp.paidBy) {
          const fromName = memberMap[pId] || 'Someone';
          const toName = memberMap[exp.paidBy] || 'Someone';
          splits.push({
            from: getInitials(fromName),
            to: getInitials(toName),
            amount: splitAmount / 100
          });
        }
      });

      return {
        id: exp.id,
        date: exp.createdAt,
        title: exp.description,
        person: exp.paidByName,
        amount: exp.amount / 100,
        state: exp.syncStatus === 'synced' ? 'Confirmed' : 'Pending confirmation',
        type: 'expense',
        splits
      };
    });

    const formattedSettlements = settlements.map(settle => {
      const settleConfirms = confirmations.filter(c => c.settlementId === settle.id);
      const splits = settleConfirms.map(c => {
        const fromName = settle.fromUserName;
        const toName = c.toUserName;
        return {
          from: getInitials(fromName),
          to: getInitials(toName),
          amount: c.amount / 100
        };
      });

      let displayState = 'Pending confirmation';
      if (settle.status === 'confirmed') {
        displayState = 'Confirmed';
      }

      return {
        id: settle.id,
        date: settle.initiatedAt,
        title: `Settled via ${settle.method.toUpperCase()}`,
        person: settle.fromUserName,
        amount: settle.amount / 100,
        state: displayState,
        type: 'settlement',
        splits
      };
    });

    const allActivities = [...formattedExpenses, ...formattedSettlements].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return res.json(allActivities);
  } catch (err) {
    console.error('Error fetching group activities:', err);
    return res.status(500).json({ error: 'Failed to fetch group activities' });
  }
});

module.exports = router;
