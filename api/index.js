const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://career-vista-ai.vercel.app',
    'https://careervista-ai.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'CareerVista AI Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'healthy'
  });
});

// Basic API endpoint for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Dynamically load routes after build
try {
  // Try to load compiled routes
  const authRoutes = require('../dist/routes/auth.routes.js');
  const userRoutes = require('../dist/routes/user.routes.js');
  const collegeRoutes = require('../dist/routes/college.routes.js');
  const scholarshipRoutes = require('../dist/routes/scholarship.routes.js');
  const loanRoutes = require('../dist/routes/loan.routes.js');
  const testRoutes = require('../dist/routes/test.routes.js');
  const adaptiveTestRoutes = require('../dist/routes/adaptiveTest.routes.js');
  const profileRoutes = require('../dist/routes/profile.routes.js');
  const financialAidRoutes = require('../dist/routes/financialAid.routes.js');
  const chatbotRoutes = require('../dist/routes/chatbot.routes.js');
  const aiRoutes = require('../dist/routes/ai.routes.js');
  const careerInsightsRoutes = require('../dist/routes/careerInsights.routes.js');
  const recommenderRoutes = require('../dist/routes/recommender.routes.js');
  const collegePredictorRoutes = require('../dist/routes/collegePredictor.routes.js');

  // Mount routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/colleges', collegeRoutes);
  app.use('/api/scholarships', scholarshipRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/tests', testRoutes);
  app.use('/api/adaptive-test', adaptiveTestRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/financial-aid', financialAidRoutes);
  app.use('/api/chatbot', chatbotRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/career-insights', careerInsightsRoutes);
  app.use('/api/recommender', recommenderRoutes);
  app.use('/api/college-predictor', collegePredictorRoutes);
  
  console.log('All routes loaded successfully');
} catch (error) {
  console.log('Routes not available yet, running in minimal mode:', error.message);
  
  // Fallback endpoints
  app.get('/api/*', (req, res) => {
    res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'Routes are being compiled, please try again in a moment',
      path: req.originalUrl
    });
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: ['/', '/api/health']
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

module.exports = app;