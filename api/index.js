// Load environment variables first
require('dotenv').config();

// Expose the Express app as a Vercel serverless function
const app = require('../backend/src/server');
module.exports = app;
