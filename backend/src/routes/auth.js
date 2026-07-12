const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretapachatihackathonkey2026';

router.post('/login', (req, res) => {
  const { method, credential, displayName, photoUrl } = req.body;

  if (!method || !credential) {
    return res.status(400).json({ error: 'Missing method or credential' });
  }

  if (!['phone', 'email', 'google'].includes(method)) {
    return res.status(400).json({ error: 'Invalid auth method' });
  }

  // Find user by phone or email depending on method
  let user;
  const now = new Date().toISOString();

  try {
    if (method === 'phone') {
      user = db.prepare('SELECT * FROM users WHERE phone = ?').get(credential);
    } else {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(credential);
    }

    if (!user) {
      // Create user lazily
      const userId = uuidv4();
      const insert = db.prepare(`
        INSERT INTO users (id, displayName, photoUrl, phone, email, authMethod, linkedPaymentMethods, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const phoneVal = method === 'phone' ? credential : null;
      const emailVal = method !== 'phone' ? credential : null;

      insert.run(
        userId,
        displayName || `User_${credential.slice(-4)}`,
        photoUrl || null,
        phoneVal,
        emailVal,
        method,
        JSON.stringify([]),
        now
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    // Sign JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Format output
    try {
      user.linkedPaymentMethods = JSON.parse(user.linkedPaymentMethods || '[]');
    } catch (e) {
      user.linkedPaymentMethods = [];
    }

    // Do not return walletSecret to client
    const clientUser = { ...user };
    delete clientUser.walletSecret;

    return res.json({
      user: clientUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

module.exports = router;
