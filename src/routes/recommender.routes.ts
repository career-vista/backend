import express from 'express';
import * as recommenderController from '../controllers/recommender.controller';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get stream recommendations based on test scores and interests
router.get('/streams', auth, recommenderController.getStreamRecommendations);

// Get career options for a specific stream
router.get('/careers/:stream', auth, recommenderController.getCareerOptions);

export default router;