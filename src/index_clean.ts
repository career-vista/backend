import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import testRoutes from './routes/test.routes';
import recommenderRoutes from './routes/recommender.routes';
import collegeRoutes from './routes/college.routes';
import scholarshipRoutes from './routes/scholarship.routes';
import loanRoutes from './routes/loan.routes';
import profileRoutes from './routes/profile.routes';
import adaptiveTestRoutes from './routes/adaptiveTest.routes';
import collegePredictorRoutes from './routes/collegePredictor.routes';
import financialAidRoutes from './routes/financialAid.routes';
import careerInsightsRoutes from './routes/careerInsights.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`📥 ${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    ip: req.ip
  });
  next();
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista';

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
logger.info('🛣️ Registering auth routes...');
app.use('/api/auth', authRoutes);
logger.info('🛣️ Auth routes registered successfully');

app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/adaptive-test', adaptiveTestRoutes);
app.use('/api/recommender', recommenderRoutes);
app.use('/api/college-predictor', collegePredictorRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/financial-aid', financialAidRoutes);
app.use('/api/career-insights', careerInsightsRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

// Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;