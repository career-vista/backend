import { Request, Response } from 'express';
import User from '../models/User';
import Question from '../models/Question';
import { logger } from '../utils/logger';
import { getAIStreamRecommendations } from '../utils/ai';

/**
 * Start adaptive test for 10th class students
 */
export const startAdaptiveTest = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is eligible for test
    if (user.class !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Adaptive test is only available for 10th class students',
      });
    }

    if (!user.profileCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before taking the test',
      });
    }

    // Get initial questions based on user's board
    const initialQuestions = await getQuestionsForTest(user.board || 'CBSE', 'Medium', 5);

    // Create test session
    const testSession = {
      sessionId: generateSessionId(),
      questions: initialQuestions.map(q => q._id),
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
      difficulty: 'Medium',
      startTime: new Date(),
      board: user.board,
    };

    res.status(200).json({
      success: true,
      message: 'Test started successfully',
      testSession: {
        sessionId: testSession.sessionId,
        totalQuestions: initialQuestions.length,
        currentQuestion: 0,
        estimatedTime: '8-10 minutes',
        question: formatQuestion(initialQuestions[0]),
      },
    });

    // Store session in memory or database (for production, use Redis)
    // For now, we'll use a simple in-memory store
    testSessions.set(testSession.sessionId, testSession);

  } catch (error) {
    logger.error('Error starting adaptive test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start test',
    });
  }
};

/**
 * Submit answer and get next question
 */
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { sessionId, answer, timeTaken } = req.body;

    if (!sessionId || answer === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and answer are required',
      });
    }

    const session = testSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Test session not found or expired',
      });
    }

    // Get current question
    const currentQuestion = await Question.findById(
      session.questions[session.currentQuestionIndex]
    );

    if (!currentQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Check answer and update score
    const isCorrect = currentQuestion.options[currentQuestion.correctOption] === answer;
    if (isCorrect) {
      session.score += currentQuestion.difficulty === 'easy' ? 1 : 
                     currentQuestion.difficulty === 'medium' ? 2 : 3;
    }

    // Store answer
    session.answers.push({
      questionId: (currentQuestion._id as any).toString(),
      answer,
      isCorrect,
      timeTaken: timeTaken || 0,
    });

    session.currentQuestionIndex++;

    // Adaptive logic: adjust difficulty based on performance
    const recentPerformance = session.answers.slice(-3);
    const recentCorrect = recentPerformance.filter((a: any) => a.isCorrect).length;
    
    if (recentCorrect >= 2 && session.difficulty !== 'Hard') {
      session.difficulty = session.difficulty === 'Easy' ? 'Medium' : 'Hard';
    } else if (recentCorrect <= 1 && session.difficulty !== 'Easy') {
      session.difficulty = session.difficulty === 'Hard' ? 'Medium' : 'Easy';
    }

    // Check if test is complete
    const maxQuestions = 20;
    const minQuestions = 15;
    const isComplete = session.currentQuestionIndex >= maxQuestions ||
      (session.currentQuestionIndex >= minQuestions && hasStablePerformance(session));

    if (isComplete) {
      return completeTest(req, res, session);
    }

    // Get next question
    const nextQuestions = await getQuestionsForTest(
      session.board,
      session.difficulty,
      1,
      session.questions // Exclude already asked questions
    );

    if (nextQuestions.length === 0) {
      return completeTest(req, res, session);
    }

    const nextQuestion = nextQuestions[0];
    session.questions.push(nextQuestion._id);

    res.status(200).json({
      success: true,
      isCorrect,
      currentScore: session.score,
      progress: Math.round((session.currentQuestionIndex / maxQuestions) * 100),
      question: formatQuestion(nextQuestion),
      feedback: isCorrect ? 
        'Correct! Well done.' : 
        `Incorrect. The correct answer is ${currentQuestion.options[currentQuestion.correctOption]}.`,
    });

  } catch (error) {
    logger.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
    });
  }
};

/**
 * Complete the adaptive test and generate recommendations
 */
const completeTest = async (req: Request, res: Response, session: any) => {
  try {
    const userId = req.userId;

    // Calculate final scores by subject
    const subjectScores = await calculateSubjectScores(session);
    
    // Calculate strengths and weaknesses
    const analysis = analyzePerformance(session, subjectScores);

    // Save test results to user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'testScores.fundamentals': {
            total: session.score,
            subjects: subjectScores,
            weaknesses: analysis.weaknesses,
            strengths: analysis.strengths,
            date: new Date(),
            timeTaken: Math.round((new Date().getTime() - session.startTime.getTime()) / 1000),
          },
        },
      },
      { new: true }
    );

    // Generate AI-powered stream recommendations
    let recommendations = [];
    try {
      const aiRecs = await getAIStreamRecommendations({
        classLevel: '10th',
        scores: subjectScores,
        interests: user?.interests || [],
        category: user?.category as any,
        state: user?.state,
      });

      recommendations = aiRecs.map(rec => ({
        stream: mapStreamCode(rec.stream),
        confidence: rec.confidence,
        rationale: rec.rationale,
        description: getStreamDescription(rec.stream),
        careerOptions: getCareerOptions(rec.stream),
        strengths: rec.strengths || [],
        weaknesses: rec.weaknesses || [],
        fitScore: rec.fitScore || rec.confidence,
        careerAlignment: rec.careerAlignment || '',
        subjectAnalysis: rec.subjectAnalysis || {}
      }));
      (recommendations as any).aiSource = 'ai';
    } catch (error) {
      logger.warn('AI recommendations failed, using fallback:', error);
      recommendations = generateFallbackRecommendations(subjectScores, user?.interests || []);
      (recommendations as any).aiSource = 'fallback';
    }

    // Note: Stream recommendations are now handled through the response data
    // No longer storing in database

    // Clean up session
    testSessions.delete(session.sessionId);

    res.status(200).json({
      success: true,
      message: 'Test completed successfully',
      results: {
        totalScore: session.score,
        maxScore: session.answers.length * 3, // Assuming max 3 points per question
        percentage: Math.round((session.score / (session.answers.length * 3)) * 100),
        subjectScores,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        timeTaken: Math.round((new Date().getTime() - session.startTime.getTime()) / 1000),
        recommendations: recommendations.slice(0, 3),
        aiSource: (recommendations as any).aiSource || 'unknown',
        badges: generateBadges(session, analysis),
      },
    });

  } catch (error) {
    logger.error('Error completing test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete test',
    });
  }
};

/**
 * Get test history for user
 */
export const getTestHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const testHistory = {
      fundamentalsTest: user.testScores?.fundamentals || null,
      adaptiveTests: user.testScores?.adaptiveTest ? [user.testScores.adaptiveTest] : [],
      recommendations: [], // Stream recommendations no longer stored in database
    };

    res.status(200).json({
      success: true,
      testHistory,
    });

  } catch (error) {
    logger.error('Error getting test history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test history',
    });
  }
};

// Helper functions
const testSessions = new Map();

const generateSessionId = (): string => {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getQuestionsForTest = async (
  board: string,
  difficulty: string,
  count: number,
  excludeIds: string[] = []
): Promise<any[]> => {
  try {
    const questions = await Question.find({
      board: { $in: [board, 'All'] },
      difficulty,
      _id: { $nin: excludeIds },
    }).limit(count * 2); // Get more to ensure variety

    // Shuffle and return requested count
    return questions.sort(() => 0.5 - Math.random()).slice(0, count);
  } catch (error) {
    logger.error('Error getting questions:', error);
    return [];
  }
};

const formatQuestion = (question: any) => {
  return {
    id: question._id,
    text: question.text,
    options: question.options,
    subject: question.subject,
    difficulty: question.difficulty,
    timeLimit: question.timeLimit || 60,
  };
};

const hasStablePerformance = (session: any): boolean => {
  if (session.answers.length < 10) return false;
  
  const last5 = session.answers.slice(-5);
  const correctCount = last5.filter((a: any) => a.isCorrect).length;
  
  // Stable if consistently getting 60-80% correct
  return correctCount >= 3 && correctCount <= 4;
};

const calculateSubjectScores = async (session: any) => {
  const subjects = { math: 0, science: 0, english: 0, socialScience: 0 };
  const subjectCounts = { math: 0, science: 0, english: 0, socialScience: 0 };

  for (const answer of session.answers) {
    const question = await Question.findById(answer.questionId);
    if (question && subjects.hasOwnProperty(question.subject)) {
      const subject = question.subject as keyof typeof subjects;
      subjects[subject] += answer.isCorrect ? 1 : 0;
      subjectCounts[subject]++;
    }
  }

  // Convert to percentages
  Object.keys(subjects).forEach(subject => {
    const key = subject as keyof typeof subjects;
    subjects[key] = subjectCounts[key] > 0 ? 
      Math.round((subjects[key] / subjectCounts[key]) * 100) : 0;
  });

  return subjects;
};

const analyzePerformance = (session: any, subjectScores: any) => {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  Object.entries(subjectScores).forEach(([subject, score]) => {
    if ((score as number) >= 80) {
      strengths.push(subject);
    } else if ((score as number) >= 60) {
      weaknesses.push(subject);
    }
  });

  return { strengths, weaknesses };
};

const mapStreamCode = (code: string): string => {
  const mapping: { [key: string]: string } = {
    'MPC': 'Science (MPC)',
    'BiPC': 'Science (BiPC)',
    'MEC': 'Commerce',
    'CEC': 'Arts (Creative)',
    'HEC': 'Arts (Humanities)',
  };
  return mapping[code] || code;
};

const getStreamDescription = (code: string): string => {
  const descriptions: { [key: string]: string } = {
    'MPC': 'Mathematics, Physics, Chemistry - Perfect for engineering and technology careers',
    'BiPC': 'Biology, Physics, Chemistry - Ideal for medical and life sciences',
    'MEC': 'Mathematics, Economics, Commerce - Great for business and finance',
    'CEC': 'Creative subjects with commerce - Perfect for design and media',
    'HEC': 'Humanities with economics - Ideal for social sciences and civil services',
  };
  return descriptions[code] || 'Comprehensive education with diverse opportunities';
};

const getCareerOptions = (code: string): string[] => {
  const careers: { [key: string]: string[] } = {
    'MPC': ['Engineer', 'Software Developer', 'Data Scientist', 'Researcher'],
    'BiPC': ['Doctor', 'Pharmacist', 'Biotechnologist', 'Research Scientist'],
    'MEC': ['Chartered Accountant', 'Investment Banker', 'Business Analyst', 'Economist'],
    'CEC': ['Graphic Designer', 'Marketing Manager', 'Content Creator', 'Entrepreneur'],
    'HEC': ['Civil Servant', 'Journalist', 'Psychologist', 'Social Worker'],
  };
  return careers[code] || ['Explore various fields', 'Take career counseling'];
};

const generateFallbackRecommendations = (subjectScores: any, interests: string[]) => {
  const recommendations = [];

  // Science stream recommendation
  if (subjectScores.math >= 60 && subjectScores.science >= 60) {
    recommendations.push({
      stream: 'Science (MPC)',
      confidence: Math.min(85, (subjectScores.math + subjectScores.science) / 2),
      rationale: 'Strong performance in Math and Science indicates good aptitude for engineering and technology',
      description: getStreamDescription('MPC'),
      careerOptions: getCareerOptions('MPC'),
      strengths: ['Mathematical reasoning', 'Scientific thinking', 'Problem solving'],
      weaknesses: ['Memorization', 'Biology concepts'],
      fitScore: Math.min(85, (subjectScores.math + subjectScores.science) / 2),
      careerAlignment: 'Engineering, Technology, Research, Medicine',
      subjectAnalysis: {
        mathematics: { score: subjectScores.math, feedback: 'Strong numerical reasoning' },
        physics: { score: subjectScores.science, feedback: 'Good conceptual understanding' },
        chemistry: { score: subjectScores.science, feedback: 'Solid foundation in chemistry' }
      }
    });
  }

  // Commerce stream recommendation
  if (subjectScores.math >= 50 && subjectScores.english >= 60) {
    recommendations.push({
      stream: 'Commerce',
      confidence: Math.min(80, (subjectScores.math + subjectScores.english) / 2),
      rationale: 'Good mathematical and communication skills suit business and finance careers',
      description: getStreamDescription('MEC'),
      careerOptions: getCareerOptions('MEC'),
      strengths: ['Numerical skills', 'Communication', 'Business thinking'],
      weaknesses: ['Advanced science', 'Memorization'],
      fitScore: Math.min(80, (subjectScores.math + subjectScores.english) / 2),
      careerAlignment: 'Business, Finance, Accounting, Management',
      subjectAnalysis: {
        mathematics: { score: subjectScores.math, feedback: 'Good numerical aptitude' },
        english: { score: subjectScores.english, feedback: 'Strong communication skills' },
        economics: { score: 70, feedback: 'Potential for economic thinking' }
      }
    });
  }

  // Arts stream recommendation
  if (subjectScores.english >= 65 && subjectScores.socialScience >= 60) {
    recommendations.push({
      stream: 'Arts (Humanities)',
      confidence: Math.min(75, (subjectScores.english + subjectScores.socialScience) / 2),
      rationale: 'Strong language and social science skills indicate aptitude for humanities',
      description: getStreamDescription('HEC'),
      careerOptions: getCareerOptions('HEC'),
      strengths: ['Communication', 'Critical thinking', 'Creative expression'],
      weaknesses: ['Advanced mathematics', 'Scientific concepts'],
      fitScore: Math.min(75, (subjectScores.english + subjectScores.socialScience) / 2),
      careerAlignment: 'Journalism, Law, Social Sciences, Arts',
      subjectAnalysis: {
        english: { score: subjectScores.english, feedback: 'Excellent language skills' },
        socialScience: { score: subjectScores.socialScience, feedback: 'Strong social awareness' },
        history: { score: 70, feedback: 'Good analytical thinking' }
      }
    });
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
};

const generateBadges = (session: any, analysis: any): string[] => {
  const badges = [];

  if (session.score >= session.answers.length * 2.5) {
    badges.push('🏆 Excellence Award');
  }
  if (analysis.strengths.length >= 3) {
    badges.push('🌟 Well-Rounded Scholar');
  }
  if (session.answers.length >= 18) {
    badges.push('💪 Persistence Champion');
  }
  if (session.answers.filter((a: any) => a.isCorrect).length >= 10) {
    badges.push('⚡ Quick Thinker');
  }

  return badges;
};
