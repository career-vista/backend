import express from 'express';
import { chatWithCounselorBot, getCounselorSuggestions, getPersonalizedRecommendation } from '../controllers/chatbot.controller';
import { auth } from '../middleware/auth';

const router = express.Router();

// Chat with career counselor AI
router.post('/chat', auth, chatWithCounselorBot);

// Get conversation starters and suggestions
router.get('/suggestions', auth, getCounselorSuggestions);

// Get personalized recommendation based on user's test results and profile
router.get('/personalized-recommendation', auth, getPersonalizedRecommendation);

export default router;