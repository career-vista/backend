const express = require('express');
const cors = require('cors');

const app = express();

// CORS
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'CareerVista AI API',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;