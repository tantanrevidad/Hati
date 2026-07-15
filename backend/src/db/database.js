const { Pool } = require('pg');
const path = require('path');

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set. Supabase/PostgreSQL is uninitialized.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Convert SQLite '?' placeholders to PostgreSQL '$1', '$2', etc.
function convertSql(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

const db = {
  // Execute a query and return all rows
  async all(sql, params = []) {
    const pgSql = convertSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rows;
  },

  // Execute a query and return the first row (or undefined)
  async get(sql, params = []) {
    const pgSql = convertSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rows[0];
  },

  // Execute a query (insert/update/delete)
  async run(sql, params = []) {
    const pgSql = convertSql(sql);
    const result = await pool.query(pgSql, params);
    return {
      changes: result.rowCount,
      lastInsertRowid: null
    };
  },

  // Execute raw query block (ignoring PRAGMAs)
  async exec(sql) {
    if (sql.trim().toUpperCase().startsWith('PRAGMA')) {
      return;
    }
    return pool.query(sql);
  }
};

// Initialize schema on Supabase asynchronously
async function initSchema() {
  if (!process.env.DATABASE_URL) {
    return;
  }
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        displayName TEXT NOT NULL,
        photoUrl TEXT,
        phone TEXT UNIQUE,
        email TEXT UNIQUE,
        authMethod TEXT NOT NULL,
        linkedPaymentMethods TEXT,
        walletAddress TEXT UNIQUE,
        walletSecret TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        hostId TEXT NOT NULL,
        joinSlug TEXT UNIQUE,
        createdAt TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        zeroBalanceSince TEXT,
        FOREIGN KEY(hostId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS group_members (
        groupId TEXT NOT NULL,
        userId TEXT NOT NULL,
        joinedAt TEXT NOT NULL,
        PRIMARY KEY (groupId, userId),
        FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        groupId TEXT NOT NULL,
        description TEXT NOT NULL,
        mentions TEXT,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'PHP',
        category TEXT NOT NULL,
        paidBy TEXT NOT NULL,
        splitType TEXT NOT NULL DEFAULT 'equal',
        splitDetails TEXT,
        source TEXT NOT NULL DEFAULT 'manual_description',
        createdAt TEXT NOT NULL,
        syncStatus TEXT NOT NULL DEFAULT 'synced',
        FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY(paidBy) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS settlements (
        id TEXT PRIMARY KEY,
        groupId TEXT NOT NULL,
        fromUserId TEXT NOT NULL,
        method TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        stellarTxHash TEXT,
        initiatedAt TEXT NOT NULL,
        FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY(fromUserId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS confirmations (
        id TEXT PRIMARY KEY,
        settlementId TEXT NOT NULL,
        toUserId TEXT NOT NULL,
        amount INTEGER NOT NULL,
        confirmedAt TEXT,
        FOREIGN KEY(settlementId) REFERENCES settlements(id) ON DELETE CASCADE,
        FOREIGN KEY(toUserId) REFERENCES users(id),
        UNIQUE(settlementId, toUserId)
      );

      CREATE TABLE IF NOT EXISTS nudges (
        id TEXT PRIMARY KEY,
        groupId TEXT NOT NULL,
        fromUserId TEXT NOT NULL,
        toUserId TEXT NOT NULL,
        sentAt TEXT NOT NULL,
        acknowledged INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY(fromUserId) REFERENCES users(id),
        FOREIGN KEY(toUserId) REFERENCES users(id)
      );
    `);
    console.log('Supabase PostgreSQL schema initialized/verified successfully.');
  } catch (err) {
    console.error('Failed to initialize database schema on Supabase:', err.message);
  }
}

initSchema();

module.exports = db;
