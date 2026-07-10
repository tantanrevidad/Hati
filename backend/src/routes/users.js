const express = require('express');
const router = express.Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.post('/me/payment-methods', authMiddleware, (req, res) => {
  const { type, referenceToken } = req.body;
  const user = req.user; // populated by authMiddleware

  if (!type || !referenceToken) {
    return res.status(400).json({ error: 'Missing type or referenceToken' });
  }

  if (!['gcash', 'maya', 'bank'].includes(type)) {
    return res.status(400).json({ error: 'Invalid payment method type' });
  }

  try {
    // Current list is parsed in authMiddleware
    const paymentMethods = user.linkedPaymentMethods || [];

    // Check if type already exists, update or add
    const existingIndex = paymentMethods.findIndex(p => p.type === type);
    const now = new Date().toISOString();
    
    if (existingIndex > -1) {
      paymentMethods[existingIndex] = { type, referenceToken, linkedAt: now };
    } else {
      paymentMethods.push({ type, referenceToken, linkedAt: now });
    }

    // Save back to DB
    const update = db.prepare('UPDATE users SET linkedPaymentMethods = ? WHERE id = ?');
    update.run(JSON.stringify(paymentMethods), user.id);

    // Reload user
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    updatedUser.linkedPaymentMethods = paymentMethods;
    
    delete updatedUser.walletSecret;

    return res.json(updatedUser);
  } catch (err) {
    console.error('Error linking payment method:', err);
    return res.status(500).json({ error: 'Failed to link payment method' });
  }
});

module.exports = router;
