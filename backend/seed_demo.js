/**
 * Lista Demo Seed Script
 * 
 * Creates an admin account (admin@demo.com) with dummy users, groups, expenses,
 * and settlements to demonstrate the smart splitting and smart settlement engine.
 * 
 * Usage: node seed_demo.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ─── Fixed IDs for reproducibility ───────────────────────────────────────────

const ADMIN_ID    = 'demo-admin-001';
const USER_MARK   = 'demo-user-002';
const USER_RINA   = 'demo-user-003';
const USER_JUN    = 'demo-user-004';
const USER_BEA    = 'demo-user-005';

const GROUP_TRIP  = 'demo-group-trip';
const GROUP_CONDO = 'demo-group-condo';
const GROUP_LUNCH = 'demo-group-lunch';

async function query(sql, params = []) {
  return pool.query(sql, params);
}

async function seed() {
  console.log('🌱 Starting Lista demo seed...\n');

  // ─── 1. Clean up any existing demo data ──────────────────────────────────

  console.log('🧹 Cleaning existing demo data...');
  
  const demoUserIds = [ADMIN_ID, USER_MARK, USER_RINA, USER_JUN, USER_BEA];
  const demoGroupIds = [GROUP_TRIP, GROUP_CONDO, GROUP_LUNCH];

  // Delete in correct order for foreign key constraints
  for (const gid of demoGroupIds) {
    await query('DELETE FROM confirmations WHERE settlementId IN (SELECT id FROM settlements WHERE groupId = $1)', [gid]);
    await query('DELETE FROM nudges WHERE groupId = $1', [gid]);
    await query('DELETE FROM settlements WHERE groupId = $1', [gid]);
    await query('DELETE FROM expenses WHERE groupId = $1', [gid]);
    await query('DELETE FROM group_members WHERE groupId = $1', [gid]);
    await query('DELETE FROM groups WHERE id = $1', [gid]);
  }

  for (const uid of demoUserIds) {
    await query('DELETE FROM users WHERE id = $1', [uid]);
  }

  // Also clean by email in case IDs changed
  await query("DELETE FROM users WHERE email = 'admin@demo.com'");

  console.log('   ✅ Cleaned\n');

  // ─── 2. Create Users ─────────────────────────────────────────────────────

  console.log('👤 Creating users...');

  const now = new Date().toISOString();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
  const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();

  const users = [
    {
      id: ADMIN_ID,
      displayName: 'Admin',
      photoUrl: null,
      phone: null,
      email: 'admin@demo.com',
      authMethod: 'email',
      linkedPaymentMethods: JSON.stringify([
        { type: 'gcash', referenceToken: '09171234567', linkedAt: oneWeekAgo }
      ]),
      walletAddress: null,
      walletSecret: null,
      createdAt: oneWeekAgo
    },
    {
      id: USER_MARK,
      displayName: 'Mark Santos',
      photoUrl: null,
      phone: '+639182345678',
      email: 'mark@demo.com',
      authMethod: 'phone',
      linkedPaymentMethods: JSON.stringify([
        { type: 'maya', referenceToken: '09182345678', linkedAt: oneWeekAgo }
      ]),
      walletAddress: null,
      walletSecret: null,
      createdAt: oneWeekAgo
    },
    {
      id: USER_RINA,
      displayName: 'Rina Cruz',
      photoUrl: null,
      phone: '+639193456789',
      email: 'rina@demo.com',
      authMethod: 'email',
      linkedPaymentMethods: JSON.stringify([
        { type: 'gcash', referenceToken: '09193456789', linkedAt: sixDaysAgo }
      ]),
      walletAddress: null,
      walletSecret: null,
      createdAt: sixDaysAgo
    },
    {
      id: USER_JUN,
      displayName: 'Jun Dela Rosa',
      photoUrl: null,
      phone: '+639204567890',
      email: 'jun@demo.com',
      authMethod: 'phone',
      linkedPaymentMethods: JSON.stringify([]),
      walletAddress: null,
      walletSecret: null,
      createdAt: fiveDaysAgo
    },
    {
      id: USER_BEA,
      displayName: 'Bea Lim',
      photoUrl: null,
      phone: '+639215678901',
      email: 'bea@demo.com',
      authMethod: 'google',
      linkedPaymentMethods: JSON.stringify([
        { type: 'gcash', referenceToken: '09215678901', linkedAt: fourDaysAgo }
      ]),
      walletAddress: null,
      walletSecret: null,
      createdAt: fourDaysAgo
    }
  ];

  for (const u of users) {
    await query(`
      INSERT INTO users (id, displayName, photoUrl, phone, email, authMethod, linkedPaymentMethods, walletAddress, walletSecret, createdAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [u.id, u.displayName, u.photoUrl, u.phone, u.email, u.authMethod, u.linkedPaymentMethods, u.walletAddress, u.walletSecret, u.createdAt]);
    console.log(`   ✅ ${u.displayName} (${u.email})`);
  }

  console.log('');

  // ─── 3. Create Groups ────────────────────────────────────────────────────

  console.log('👥 Creating groups...');

  const groups = [
    {
      id: GROUP_TRIP,
      name: 'Boracay Trip 🏖️',
      hostId: ADMIN_ID,
      joinSlug: 'bora2026',
      createdAt: sixDaysAgo,
      status: 'active',
      zeroBalanceSince: null,
      members: [ADMIN_ID, USER_MARK, USER_RINA, USER_JUN, USER_BEA]
    },
    {
      id: GROUP_CONDO,
      name: 'BGC Condo 🏢',
      hostId: ADMIN_ID,
      joinSlug: 'bgccondo',
      createdAt: oneWeekAgo,
      status: 'active',
      zeroBalanceSince: null,
      members: [ADMIN_ID, USER_MARK, USER_RINA]
    },
    {
      id: GROUP_LUNCH,
      name: 'Friday Team Lunch 🍜',
      hostId: USER_MARK,
      joinSlug: 'teamlnch',
      createdAt: threeDaysAgo,
      status: 'active',
      zeroBalanceSince: null,
      members: [ADMIN_ID, USER_MARK, USER_JUN, USER_BEA]
    }
  ];

  for (const g of groups) {
    await query(`
      INSERT INTO groups (id, name, hostId, joinSlug, createdAt, status, zeroBalanceSince)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [g.id, g.name, g.hostId, g.joinSlug, g.createdAt, g.status, g.zeroBalanceSince]);
    console.log(`   ✅ ${g.name}`);

    for (const memberId of g.members) {
      await query(`
        INSERT INTO group_members (groupId, userId, joinedAt)
        VALUES ($1, $2, $3)
      `, [g.id, memberId, g.createdAt]);
    }
  }

  console.log('');

  // ─── 4. Create Expenses ──────────────────────────────────────────────────
  //
  // These expenses demonstrate:
  //  - Equal splits across all members (default)
  //  - Equal splits with specific participants (@mentions)
  //  - Custom splits with exact amounts per person
  //  - Multiple payers across the group
  //  - Various categories & sources
  //
  // ─────────────────────────────────────────────────────────────────────────

  console.log('💸 Creating expenses...');

  const expenses = [
    // ──── GROUP: Boracay Trip ──────────────────────────────────────────────
    {
      id: uuidv4(),
      groupId: GROUP_TRIP,
      description: 'Beach resort villa — 3 nights',
      mentions: JSON.stringify([]),
      amount: 2500000, // ₱25,000.00
      currency: 'PHP',
      category: 'accommodation',
      paidBy: ADMIN_ID,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_MARK, USER_RINA, USER_JUN, USER_BEA] }),
      source: 'manual_description',
      createdAt: sixDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_TRIP,
      description: 'Grocery run — snacks, drinks, and sunscreen',
      mentions: JSON.stringify([]),
      amount: 480000, // ₱4,800.00
      currency: 'PHP',
      category: 'groceries',
      paidBy: USER_MARK,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_MARK, USER_RINA, USER_JUN, USER_BEA] }),
      source: 'invoice_scan',
      createdAt: fiveDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_TRIP,
      description: 'Island hopping boat tour for everyone',
      mentions: JSON.stringify([]),
      amount: 750000, // ₱7,500.00
      currency: 'PHP',
      category: 'activities',
      paidBy: USER_RINA,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_MARK, USER_RINA, USER_JUN, USER_BEA] }),
      source: 'manual_description',
      createdAt: fiveDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_TRIP,
      description: 'Dinner at Lemoni Café — @Mark and @Rina had extra cocktails',
      mentions: JSON.stringify([USER_MARK, USER_RINA]),
      amount: 620000, // ₱6,200.00
      currency: 'PHP',
      category: 'dining',
      paidBy: ADMIN_ID,
      splitType: 'custom',
      splitDetails: JSON.stringify({
        shares: {
          [ADMIN_ID]: 100000,   // ₱1,000 (just food)
          [USER_MARK]: 180000,  // ₱1,800 (food + cocktails)
          [USER_RINA]: 170000,  // ₱1,700 (food + cocktails)
          [USER_JUN]: 85000,    // ₱850 (light meal)
          [USER_BEA]: 85000     // ₱850 (light meal)
        }
      }),
      source: 'manual_description',
      createdAt: fourDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_TRIP,
      description: 'Jet ski rental — only @Admin, @Jun, and @Bea went',
      mentions: JSON.stringify([ADMIN_ID, USER_JUN, USER_BEA]),
      amount: 450000, // ₱4,500.00
      currency: 'PHP',
      category: 'activities',
      paidBy: USER_JUN,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_JUN, USER_BEA] }),
      source: 'manual_description',
      createdAt: fourDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_TRIP,
      description: 'Parasailing adventure 🪂',
      mentions: JSON.stringify([]),
      amount: 350000, // ₱3,500.00
      currency: 'PHP',
      category: 'activities',
      paidBy: USER_BEA,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_MARK, USER_RINA, USER_JUN, USER_BEA] }),
      source: 'manual_description',
      createdAt: threeDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_TRIP,
      description: 'Farewell dinner at Smoke Restaurant — custom bill split',
      mentions: JSON.stringify([]),
      amount: 850000, // ₱8,500.00
      currency: 'PHP',
      category: 'dining',
      paidBy: USER_MARK,
      splitType: 'custom',
      splitDetails: JSON.stringify({
        shares: {
          [ADMIN_ID]: 200000,   // ₱2,000
          [USER_MARK]: 150000,  // ₱1,500
          [USER_RINA]: 200000,  // ₱2,000
          [USER_JUN]: 150000,   // ₱1,500
          [USER_BEA]: 150000    // ₱1,500
        }
      }),
      source: 'invoice_scan',
      createdAt: twoDaysAgo,
      syncStatus: 'synced'
    },

    // ──── GROUP: BGC Condo ─────────────────────────────────────────────────
    {
      id: uuidv4(),
      groupId: GROUP_CONDO,
      description: 'July rent — condo unit',
      mentions: JSON.stringify([]),
      amount: 4500000, // ₱45,000.00
      currency: 'PHP',
      category: 'rent',
      paidBy: ADMIN_ID,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_MARK, USER_RINA] }),
      source: 'manual_description',
      createdAt: oneWeekAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_CONDO,
      description: 'Meralco electricity bill — June',
      mentions: JSON.stringify([]),
      amount: 285000, // ₱2,850.00
      currency: 'PHP',
      category: 'utilities',
      paidBy: USER_MARK,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_MARK, USER_RINA] }),
      source: 'invoice_scan',
      createdAt: sixDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_CONDO,
      description: 'WiFi subscription — PLDT Home Fibr',
      mentions: JSON.stringify([]),
      amount: 249900, // ₱2,499.00
      currency: 'PHP',
      category: 'utilities',
      paidBy: USER_RINA,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_MARK, USER_RINA] }),
      source: 'manual_description',
      createdAt: fiveDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_CONDO,
      description: 'Water bill — Manila Water',
      mentions: JSON.stringify([]),
      amount: 95000, // ₱950.00
      currency: 'PHP',
      category: 'utilities',
      paidBy: ADMIN_ID,
      splitType: 'custom',
      splitDetails: JSON.stringify({
        shares: {
          [ADMIN_ID]: 40000,   // ₱400 (has en-suite, uses more water)
          [USER_MARK]: 30000,  // ₱300
          [USER_RINA]: 25000   // ₱250
        }
      }),
      source: 'invoice_scan',
      createdAt: threeDaysAgo,
      syncStatus: 'synced'
    },

    // ──── GROUP: Friday Team Lunch ─────────────────────────────────────────
    {
      id: uuidv4(),
      groupId: GROUP_LUNCH,
      description: 'Ramen Nagi — Friday lunch',
      mentions: JSON.stringify([]),
      amount: 320000, // ₱3,200.00
      currency: 'PHP',
      category: 'dining',
      paidBy: USER_MARK,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_MARK, USER_JUN, USER_BEA] }),
      source: 'manual_description',
      createdAt: threeDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_LUNCH,
      description: 'Milk tea run — Tiger Sugar 🧋',
      mentions: JSON.stringify([]),
      amount: 76000, // ₱760.00
      currency: 'PHP',
      category: 'dining',
      paidBy: USER_BEA,
      splitType: 'equal',
      splitDetails: JSON.stringify({ participantIds: [ADMIN_ID, USER_MARK, USER_JUN, USER_BEA] }),
      source: 'manual_description',
      createdAt: twoDaysAgo,
      syncStatus: 'synced'
    },
    {
      id: uuidv4(),
      groupId: GROUP_LUNCH,
      description: 'Korean BBQ — @Jun had extra samgyupsal',
      mentions: JSON.stringify([USER_JUN]),
      amount: 420000, // ₱4,200.00
      currency: 'PHP',
      category: 'dining',
      paidBy: ADMIN_ID,
      splitType: 'custom',
      splitDetails: JSON.stringify({
        shares: {
          [ADMIN_ID]: 100000,  // ₱1,000
          [USER_MARK]: 100000, // ₱1,000
          [USER_JUN]: 120000,  // ₱1,200 (extra samgyupsal)
          [USER_BEA]: 100000   // ₱1,000
        }
      }),
      source: 'manual_description',
      createdAt: yesterday,
      syncStatus: 'synced'
    }
  ];

  for (const e of expenses) {
    await query(`
      INSERT INTO expenses (id, groupId, description, mentions, amount, currency, category, paidBy, splitType, splitDetails, source, createdAt, syncStatus)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [e.id, e.groupId, e.description, e.mentions, e.amount, e.currency, e.category, e.paidBy, e.splitType, e.splitDetails, e.source, e.createdAt, e.syncStatus]);
    
    const amountPhp = (e.amount / 100).toLocaleString('en-PH', { minimumFractionDigits: 2 });
    console.log(`   ✅ ₱${amountPhp} — ${e.description.substring(0, 50)}`);
  }

  console.log('');

  // ─── 5. Create Settlements ───────────────────────────────────────────────
  //
  // These demonstrate:
  //  - A confirmed QRPH settlement (auto-confirmed)
  //  - An awaiting_confirmation cash settlement
  //  - Shows the settlement engine reducing total transactions needed
  //
  // ─────────────────────────────────────────────────────────────────────────

  console.log('🤝 Creating settlements...');

  // Settlement 1: Mark pays Admin via QRPH for the Condo group (confirmed)
  const settle1Id = uuidv4();
  const confirm1Id = uuidv4();
  
  await query(`
    INSERT INTO settlements (id, groupId, fromUserId, method, amount, status, stellarTxHash, initiatedAt)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [settle1Id, GROUP_CONDO, USER_MARK, 'qrph', 500000, 'confirmed', null, twoDaysAgo]);
  
  await query(`
    INSERT INTO confirmations (id, settlementId, toUserId, amount, confirmedAt)
    VALUES ($1, $2, $3, $4, $5)
  `, [confirm1Id, settle1Id, ADMIN_ID, 500000, twoDaysAgo]);
  
  console.log('   ✅ Mark → Admin ₱5,000 via QRPH (confirmed) — BGC Condo');

  // Settlement 2: Jun pays Admin via cash for the Boracay Trip (awaiting confirmation)
  const settle2Id = uuidv4();
  const confirm2Id = uuidv4();
  
  await query(`
    INSERT INTO settlements (id, groupId, fromUserId, method, amount, status, stellarTxHash, initiatedAt)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [settle2Id, GROUP_TRIP, USER_JUN, 'cash', 300000, 'awaiting_confirmation', null, yesterday]);
  
  await query(`
    INSERT INTO confirmations (id, settlementId, toUserId, amount, confirmedAt)
    VALUES ($1, $2, $3, $4, $5)
  `, [confirm2Id, settle2Id, ADMIN_ID, 300000, null]);
  
  console.log('   ✅ Jun → Admin ₱3,000 via Cash (awaiting confirmation) — Boracay Trip');

  // Settlement 3: Bea pays Mark via QRPH for the Team Lunch (confirmed)
  const settle3Id = uuidv4();
  const confirm3Id = uuidv4();

  await query(`
    INSERT INTO settlements (id, groupId, fromUserId, method, amount, status, stellarTxHash, initiatedAt)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [settle3Id, GROUP_LUNCH, USER_BEA, 'qrph', 100000, 'confirmed', null, yesterday]);

  await query(`
    INSERT INTO confirmations (id, settlementId, toUserId, amount, confirmedAt)
    VALUES ($1, $2, $3, $4, $5)
  `, [confirm3Id, settle3Id, USER_MARK, 100000, yesterday]);

  console.log('   ✅ Bea → Mark ₱1,000 via QRPH (confirmed) — Team Lunch');

  console.log('');

  // ─── 6. Print Summary ────────────────────────────────────────────────────

  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  🎉 Demo seed complete!');
  console.log('');
  console.log('  ┌─────────────────────────────────────────────────────┐');
  console.log('  │  Admin Login Credentials                           │');
  console.log('  │                                                     │');
  console.log('  │  📧  Email:    admin@demo.com                      │');
  console.log('  │  🔑  Password: 123456                              │');
  console.log('  │                                                     │');
  console.log('  │  (Select "Email" method on the login page)         │');
  console.log('  └─────────────────────────────────────────────────────┘');
  console.log('');
  console.log('  📊 Seeded Data Summary:');
  console.log(`     • ${users.length} users (1 admin + ${users.length - 1} dummy)`);
  console.log(`     • ${groups.length} groups`);
  console.log(`     • ${expenses.length} expenses (equal + custom splits)`);
  console.log('     • 3 settlements (QRPH confirmed + Cash awaiting)');
  console.log('');
  console.log('  🧠 Smart Splitting Demo Highlights:');
  console.log('     • Boracay Trip: 7 expenses mixing equal & custom splits');
  console.log('     • Jet ski rental: only 3/5 members participated');
  console.log('     • Dinner at Lemoni: custom per-person amounts');
  console.log('     • BGC Condo: utilities with proportional water split');
  console.log('');
  console.log('  ⚡ Smart Settlement Demo Highlights:');
  console.log('     • Debt simplification reduces N×N debts to minimal transactions');
  console.log('     • View the ledger at GET /groups/:id/ledger');
  console.log('     • Confirmed QRPH settlement already factored into balances');
  console.log('     • Pending cash settlement awaiting Admin confirmation');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');

  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  pool.end();
  process.exit(1);
});
