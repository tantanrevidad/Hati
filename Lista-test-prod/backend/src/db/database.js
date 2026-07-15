const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Ensure db directory exists
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'lista.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    displayName TEXT NOT NULL,
    photoUrl TEXT,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    authMethod TEXT NOT NULL,
    linkedPaymentMethods TEXT, -- JSON string
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
    status TEXT NOT NULL DEFAULT 'active', -- active | archived
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
    mentions TEXT, -- JSON array of user IDs
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PHP',
    category TEXT NOT NULL, -- rent | utilities | groceries | other
    paidBy TEXT NOT NULL,
    splitType TEXT NOT NULL DEFAULT 'equal', -- equal | percentage | itemized | custom
    splitDetails TEXT, -- JSON string
    source TEXT NOT NULL DEFAULT 'manual_description', -- manual_description | invoice_scan
    createdAt TEXT NOT NULL,
    syncStatus TEXT NOT NULL DEFAULT 'synced',
    FOREIGN KEY(groupId) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY(paidBy) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settlements (
    id TEXT PRIMARY KEY,
    groupId TEXT NOT NULL,
    fromUserId TEXT NOT NULL,
    method TEXT NOT NULL, -- qrph | cash | stellar
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | awaiting_confirmation | confirmed | failed
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
    confirmedAt TEXT, -- ISO8601 timestamp or NULL
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

console.log('SQLite database initialized at', dbPath);

module.exports = db;
