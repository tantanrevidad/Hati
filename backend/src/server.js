const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const settlementRoutes = require('./routes/settlements');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '50mb' }));

// Register API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/', groupRoutes);
app.use('/', settlementRoutes);

const { analyzeReceiptText } = require('./services/gemini');
const authMiddleware = require('./middleware/auth');

app.post('/api/analyze-receipt', authMiddleware, async (req, res) => {
  try {
    const { description, groupMembersCount, userName } = req.body;
    const parsedData = await analyzeReceiptText(description, groupMembersCount, userName);
    res.json(parsedData);
  } catch (err) {
    console.error('Error in analyze-receipt endpoint:', err.message);
    res.status(500).json({ error: err.message || 'Failed to analyze receipt text' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start listening if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Lista backend server listening on port ${PORT}`);
  });
}

module.exports = app; // export for testing
