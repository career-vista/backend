import { Request, Response } from 'express';
import User from '../models/User';
import Question from '../models/Question';
import { logger } from '../utils/logger';

/**
 * Get questions for academic test
 */
export const getAcademicQuestions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    logger.info(`Getting academic questions for user: ${userId}`);
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      logger.error(`User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
            // Check if user has already taken the test
    // Priority: examCompleted should be the main indicator
    if (user.examCompleted) {
      logger.info(`User ${userId} has already taken the academic test (examCompleted: true)`);
      return res.status(400).json({
        success: false,
        message: 'You have already taken the academic test',
        examCompleted: user.examCompleted,
        testScores: user.testScores?.fundamentals,
      });
    }
    
    // If examCompleted is false but testScores exist, allow retaking (this handles data inconsistency)
    if (user.testScores?.fundamentals && !user.examCompleted) {
      logger.info(`User ${userId} has testScores but examCompleted is false - allowing retake`);
    }
    
    // Get ALL questions from database (no limit)
    logger.info('Fetching all questions from database...');
    
    // Get all math questions (subject: "Mathematics")
    const mathQuestions = await Question.find({
      subject: 'Mathematics',
    })
      .select('-correctAnswer -explanation'); // Don't send answers to client
    
    // Get all science questions (subject: "Science" or "Physics", "Chemistry", "Biology")
    const scienceQuestions = await Question.find({
      subject: { $in: ['Science', 'Physics', 'Chemistry', 'Biology'] },
    })
      .select('-correctAnswer -explanation');
    
    // Get all english questions (subject: "English")
    const englishQuestions = await Question.find({
      subject: 'English',
    })
      .select('-correctAnswer -explanation');
    
    // Get all social science questions (subject: "Social Science", "History", "Geography", "Civics")
    const socialScienceQuestions = await Question.find({
      subject: { $in: ['Social Science', 'History', 'Geography', 'Civics'] },
    })
      .select('-correctAnswer -explanation');
    
    // Combine all questions
    let questions = [
      ...mathQuestions,
      ...scienceQuestions,
      ...englishQuestions,
      ...socialScienceQuestions,
    ];
    
    logger.info(`Found ${questions.length} questions from DB (Math: ${mathQuestions.length}, Science: ${scienceQuestions.length}, English: ${englishQuestions.length}, Social: ${socialScienceQuestions.length})`);
    
    // If we have fewer than expected questions from DB, try to get more from all subjects
    if (questions.length < 10) {
      logger.info('Not enough questions found, trying to get any available questions...');
      
      // Get any available questions to reach a minimum count
      const additionalQuestions = await Question.find({
        _id: { $nin: questions.map(q => q._id) } // Exclude already selected questions
      })
        .limit(50 - questions.length) // Get up to 50 total questions
        .select('-correctAnswer -explanation');
      
      questions = [...questions, ...additionalQuestions];
      logger.info(`After adding additional questions: ${questions.length} total questions`);
    }
    
    // If still not enough questions in database, use sample questions as fallback
    if (questions.length < 4) {
      logger.warn('Very few questions in database, using sample questions as fallback...');
      
      // Create sample questions for testing
      const sampleQuestions = [
        {
          _id: 'sample1',
          id: 1,
          text: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1, // Index of correct option (0-based)
          subject: "Mathematics",
          difficulty: "Easy",
          class: 10,
          board: "All",
          timeLimit: 60,
          explanation: "Basic addition: 2 + 2 = 4"
        },
        {
          _id: 'sample2', 
          id: 2,
          text: "What is the chemical symbol for water?",
          options: ["H2O", "CO2", "NaCl", "O2"],
          correctAnswer: 0, // Index of correct option (0-based)
          subject: "Science",
          difficulty: "Easy",
          class: 10,
          board: "All",
          timeLimit: 60,
          explanation: "Water molecule consists of 2 hydrogen atoms and 1 oxygen atom"
        },
        {
          _id: 'sample3',
          id: 3,
          text: "Who wrote 'Romeo and Juliet'?",
          options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
          correctAnswer: 1, // Index of correct option (0-based)
          subject: "English",
          difficulty: "Medium",
          class: 10,
          board: "All",
          timeLimit: 60,
          explanation: "William Shakespeare wrote Romeo and Juliet in the early part of his career"
        },
        {
          _id: 'sample4',
          id: 4,
          text: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Rome"],
          correctAnswer: 2, // Index of correct option (0-based)
          subject: "Social Science",
          difficulty: "Easy",
          class: 10,
          board: "All",
          timeLimit: 60,
          explanation: "Paris has been the capital of France since 987 AD"
        }
      ];
      
      questions = sampleQuestions as any; // Type assertion for sample questions
      logger.warn('Using sample questions because insufficient database questions');
    }

    // Calculate dynamic time limit: number of questions × 0.75 minutes (45 seconds per question)
    const timeLimit = Math.ceil(questions.length * 0.75); // Round up to nearest minute
    
    // Group questions by subject for better organization
    const groupedQuestions = {
      Mathematics: mathQuestions,
      Science: scienceQuestions, 
      English: englishQuestions,
      SocialScience: socialScienceQuestions
    };

    logger.info(`Test configured with ${questions.length} questions and ${timeLimit} minutes time limit`);

    return res.status(200).json({
      success: true,
      message: 'Test questions retrieved successfully',
      data: {
        questions,
        groupedQuestions,
        timeLimit, // Dynamic time based on question count
        totalQuestions: questions.length,
        questionsPerSubject: {
          Mathematics: mathQuestions.length,
          Science: scienceQuestions.length,
          English: englishQuestions.length,
          SocialScience: socialScienceQuestions.length
        }
      }
    });
  } catch (error) {
    logger.error('Error getting academic questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions',
    });
  }
};

/**
 * Submit academic test
 */
export const submitAcademicTest = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { answers } = req.body;
    
    // Validate answers format and handle empty submissions (auto-submit scenarios)
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers format',
      });
    }

    // Handle case where student exits fullscreen (auto-submit with potentially no answers)
    if (answers.length === 0) {
      // Create a zero score result for auto-submit
      const zeroResult = {
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        percentageScore: 0,
        subjectScores: {
          Mathematics: 0,
          Science: 0,
          English: 0,
          'Social Science': 0,
        },
        timeSpent: 0,
        submittedAt: new Date().toISOString()
      };

      // Update user with zero score
      await User.findByIdAndUpdate(userId, {
        $set: {
          'testScores.fundamentals': {
            total: 0,
            subjects: { math: 0, science: 0, english: 0, socialScience: 0 },
            weaknesses: ['Mathematics', 'Science', 'English', 'Social Science'],
            strengths: [],
            date: new Date(),
            timeTaken: 0
          },
          examCompleted: true,
          examDate: new Date(),
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Test auto-submitted due to violation',
        data: zeroResult,
        examCompleted: true,
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
        // Check if user has already taken the test
    if (user.examCompleted) {
      return res.status(400).json({
        success: false,
        message: 'You have already taken the academic test',
        examCompleted: user.examCompleted,
        testScores: user.testScores?.fundamentals,
      });
    }
    
    // Process answers and calculate score
    const correctAnswers = {
      total: 0,
      subjects: {
        math: 0,
        science: 0,
        english: 0,
        socialScience: 0,
      },
    };

    // Track questions by subject for percentage calculation
    const subjectCounts = {
      math: 0,
      science: 0,
      english: 0,
      socialScience: 0,
    };

    const weaknesses: string[] = [];
    const strengths: string[] = [];
    const startTime = new Date(Date.now() - (answers.length * 0.75 * 60 * 1000)); // Estimate based on time limit (45 seconds per question)
    const timeTaken = Math.ceil((Date.now() - startTime.getTime()) / (1000 * 60)); // in minutes

    // First, get total questions available by subject to calculate proper percentages
    const totalQuestionsBySubject = {
      math: 0,
      science: 0,
      english: 0,
      socialScience: 0,
    };

    // Count total questions available in each subject from the test
    // Use the same query logic as in getAcademicQuestions to ensure consistency
    try {
      // Debug: First check what questions exist
      const allQuestions = await Question.find({}).limit(5);
      console.log('Sample questions for debugging:', allQuestions.map(q => ({ 
        subject: q.subject, 
        class: q.class
      })));

      // Count using the exact same criteria as in getAcademicQuestions
      const mathTotal = await Question.countDocuments({ 
        subject: 'Mathematics'
      });
      
      const scienceTotal = await Question.countDocuments({ 
        subject: { $in: ['Science', 'Physics', 'Chemistry', 'Biology'] }
      });
      
      const englishTotal = await Question.countDocuments({ 
        subject: 'English'
      });
      
      const socialScienceTotal = await Question.countDocuments({ 
        subject: { $in: ['Social Science', 'History', 'Geography', 'Civics'] }
      });
      
      totalQuestionsBySubject.math = mathTotal;
      totalQuestionsBySubject.science = scienceTotal;
      totalQuestionsBySubject.english = englishTotal;
      totalQuestionsBySubject.socialScience = socialScienceTotal;
      
      console.log('Total questions by subject (detailed):', totalQuestionsBySubject);
      console.log('Math:', mathTotal, 'Science:', scienceTotal, 'English:', englishTotal, 'Social Science:', socialScienceTotal);
      
      // If counts are still 0, fallback to the actual questions fetched for this test
      const totalFromAllCounts = mathTotal + scienceTotal + englishTotal + socialScienceTotal;
      if (totalFromAllCounts === 0) {
        console.log('Database count returned 0, using questions from original query...');
        
        // Use the exact same query that getAcademicQuestions uses to get actual counts
        const mathQuestions = await Question.find({ 
          subject: 'Mathematics'
        });
        const scienceQuestions = await Question.find({ 
          subject: { $in: ['Science', 'Physics', 'Chemistry', 'Biology'] }
        });
        const englishQuestions = await Question.find({ 
          subject: 'English'
        });
        const socialScienceQuestions = await Question.find({ 
          subject: { $in: ['Social Science', 'History', 'Geography', 'Civics'] }
        });
        
        totalQuestionsBySubject.math = mathQuestions.length;
        totalQuestionsBySubject.science = scienceQuestions.length;
        totalQuestionsBySubject.english = englishQuestions.length;
        totalQuestionsBySubject.socialScience = socialScienceQuestions.length;
        
        console.log('Updated total questions by subject (from actual query):', totalQuestionsBySubject);
      }
      
    } catch (error) {
      console.error('Error counting questions by subject:', error);
      // Use reasonable fallback values based on the log showing 10 Math, 30 Science, 0 English, 10 Social
      totalQuestionsBySubject.math = 10;
      totalQuestionsBySubject.science = 30;
      totalQuestionsBySubject.english = 0;
      totalQuestionsBySubject.socialScience = 10;
      console.log('Using fallback values:', totalQuestionsBySubject);
    }

    // Process each answer
    for (const answer of answers) {
      const { questionId, selectedOption } = answer;
      
      console.log(`Processing answer: questionId=${questionId}, selectedOption=${selectedOption}`);
      
      // Find question in database
      let isCorrect = false;
      let subject: 'math' | 'science' | 'english' | 'socialScience' = 'math'; // default
      
      try {
        const question = await Question.findById(questionId);
        if (question) {
          console.log(`Found question: subject=${question.subject}, correctAnswer=${question.correctAnswer}`);
          
          // Map question subject to our subject keys
          const subjectMap: Record<string, 'math' | 'science' | 'english' | 'socialScience'> = {
            'Mathematics': 'math',
            'Math': 'math',
            'Science': 'science', 
            'English': 'english',
            'Social Science': 'socialScience',
            'SocialScience': 'socialScience'
          };
          subject = subjectMap[question.subject] || 'math';
          
          // Check if answer is correct
          // selectedOption is the index from frontend (0-based)
          // correctAnswer from DB is the index of correct option (0-based)
          // Convert both to numbers to ensure proper comparison
          const selectedOptionNum = Number(selectedOption);
          const correctAnswerNum = Number(question.correctAnswer);
          isCorrect = selectedOptionNum === correctAnswerNum;
          
          console.log(`Answer check: selectedOption=${selectedOption} (${typeof selectedOption}), correctAnswer=${question.correctAnswer} (${typeof question.correctAnswer}), selectedOptionNum=${selectedOptionNum}, correctAnswerNum=${correctAnswerNum}, isCorrect=${isCorrect}, subject=${subject}`);
        } else {
          console.log(`Question not found in database for ID: ${questionId}`);
        }
      } catch (error) {
        logger.error(`Error finding question ${questionId}:`, error);
        
        // Fallback: try to match from sample questions if DB query fails
        const sampleQuestions = [
          { _id: 'sample1', subject: 'Mathematics', correctAnswer: 1 }, // "4"
          { _id: 'sample2', subject: 'Science', correctAnswer: 0 }, // "H2O"
          { _id: 'sample3', subject: 'English', correctAnswer: 1 }, // "William Shakespeare"
          { _id: 'sample4', subject: 'Social Science', correctAnswer: 2 }, // "Paris"
        ];
        
        const sampleQuestion = sampleQuestions.find(q => q._id === questionId);
        if (sampleQuestion) {
          const subjectMap: Record<string, 'math' | 'science' | 'english' | 'socialScience'> = {
            'Mathematics': 'math',
            'Math': 'math',
            'Science': 'science', 
            'English': 'english',
            'Social Science': 'socialScience'
          };
          subject = subjectMap[sampleQuestion.subject] || 'math';
          // Convert both to numbers to ensure proper comparison
          isCorrect = Number(selectedOption) === Number(sampleQuestion.correctAnswer);
        }
      }
      
      // Increment subject count (questions attempted in this subject)
      subjectCounts[subject]++;
      
      // Check if answer is correct
      if (isCorrect) {
        correctAnswers.subjects[subject]++;
        correctAnswers.total++;
      }
      
      console.log(`After processing: subject=${subject}, isCorrect=${isCorrect}`);
    }

    console.log('Final counts:');
    console.log('correctAnswers:', correctAnswers);
    console.log('subjectCounts (attempted):', subjectCounts);
    console.log('totalQuestionsBySubject (available):', totalQuestionsBySubject);
    console.log('Total answers processed:', answers.length);

    // Calculate total available questions across all subjects
    const totalAvailableQuestions = Object.values(totalQuestionsBySubject).reduce((sum, count) => sum + count, 0);

    // Calculate percentages based on total questions available, not just attempted
    const subjectPercentages: Record<string, number> = {};
    Object.keys(correctAnswers.subjects).forEach((subjectKey) => {
      const subject = subjectKey as 'math' | 'science' | 'english' | 'socialScience';
      const totalQuestionsInSubject = totalQuestionsBySubject[subject];
      
      if (totalQuestionsInSubject > 0) {
        // Calculate percentage based on total questions available in this subject
        const percentage = Math.round((correctAnswers.subjects[subject] / totalQuestionsInSubject) * 100);
        // Ensure percentage is a valid number
        subjectPercentages[subject] = isNaN(percentage) ? 0 : percentage;
        
        console.log(`${subject}: ${correctAnswers.subjects[subject]} correct out of ${totalQuestionsInSubject} available = ${percentage}%`);
        
        // Determine strengths (>= 70%) and weaknesses (< 50%) based on percentage of available questions
        if (percentage >= 70) {
          strengths.push(subject.charAt(0).toUpperCase() + subject.slice(1));
        } else if (percentage < 50) {
          weaknesses.push(subject.charAt(0).toUpperCase() + subject.slice(1));
        }
      } else {
        // If no questions available in this subject, percentage is 0
        subjectPercentages[subject] = 0;
        console.log(`${subject}: No questions available in this subject`);
      }
    });

    // Calculate total percentage based on total available questions in the test
    const totalPercentage = totalAvailableQuestions > 0 ? 
      Math.round((correctAnswers.total / totalAvailableQuestions) * 100) : 0;
    const safePercentage = isNaN(totalPercentage) ? 0 : totalPercentage;
    const incorrectAnswers = Math.max(0, totalAvailableQuestions - correctAnswers.total); // Include unanswered as incorrect

    console.log(`Overall: ${correctAnswers.total} correct out of ${totalAvailableQuestions} available = ${safePercentage}%`);

    // Create test scores object matching the user structure (for database)
    const academicScore = {
      total: safePercentage,
      subjects: {
        math: subjectPercentages.math || 0,
        science: subjectPercentages.science || 0,
        english: subjectPercentages.english || 0,
        socialScience: subjectPercentages.socialScience || 0,
      },
      weaknesses: weaknesses,
      strengths: strengths,
      date: new Date(),
      timeTaken: timeTaken
    };

    // Create response data matching SecureTestResults interface
    const responseData = {
      totalQuestions: totalAvailableQuestions, // Total questions available in the test
      questionsAttempted: answers.length, // Questions the user actually answered
      correctAnswers: correctAnswers.total,
      incorrectAnswers: incorrectAnswers,
      unansweredQuestions: totalAvailableQuestions - answers.length, // Questions not attempted
      percentageScore: safePercentage,
      subjectScores: {
        Mathematics: subjectPercentages.math || 0,
        Science: subjectPercentages.science || 0,
        English: subjectPercentages.english || 0,
        'Social Science': subjectPercentages.socialScience || 0,
      },
      subjectBreakdown: {
        Mathematics: {
          attempted: subjectCounts.math || 0,
          correct: correctAnswers.subjects.math || 0,
          available: totalQuestionsBySubject.math || 0,
          percentage: subjectPercentages.math || 0
        },
        Science: {
          attempted: subjectCounts.science || 0,
          correct: correctAnswers.subjects.science || 0,
          available: totalQuestionsBySubject.science || 0,
          percentage: subjectPercentages.science || 0
        },
        English: {
          attempted: subjectCounts.english || 0,
          correct: correctAnswers.subjects.english || 0,
          available: totalQuestionsBySubject.english || 0,
          percentage: subjectPercentages.english || 0
        },
        'Social Science': {
          attempted: subjectCounts.socialScience || 0,
          correct: correctAnswers.subjects.socialScience || 0,
          available: totalQuestionsBySubject.socialScience || 0,
          percentage: subjectPercentages.socialScience || 0
        }
      },
      timeSpent: timeTaken * 60, // Convert minutes to seconds for frontend
      submittedAt: new Date().toISOString()
    };

    console.log('Final response data:', responseData);
    console.log('Subject percentages:', subjectPercentages);
    console.log('Total percentage:', safePercentage);

    // Update user with test scores and mark exam as completed
    await User.findByIdAndUpdate(userId, {
      $set: {
        'testScores.fundamentals': academicScore,
        examCompleted: true,
        examDate: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: responseData, // Use 'data' key to match frontend expectations
      examCompleted: true,
    });
  } catch (error) {
    logger.error('Error submitting academic test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit test',
    });
  }
};

/**
 * Get test results
 */
export const getTestResults = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { testId } = req.params;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if test exists
    if (testId === 'academic') {
      if (!user.testScores?.fundamentals) {
        return res.status(404).json({
          success: false,
          message: 'You have not taken the academic test yet',
        });
      }
      
      return res.status(200).json({
        success: true,
        results: user.testScores.fundamentals,
      });
    }
    
    // If test ID is not recognized
    res.status(404).json({
      success: false,
      message: 'Test not found',
    });
  } catch (error) {
    logger.error('Error getting test results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get test results',
    });
  }
};

/**
 * Save test session on fullscreen exit
 */
export const saveTestSession = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { currentQuestionIndex, answers, timeRemaining, violationCount } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Save current test session state
    await User.findByIdAndUpdate(userId, {
      $set: {
        'testSession': {
          currentQuestionIndex,
          answers,
          timeRemaining,
          violationCount: violationCount || 0,
          lastSaved: new Date(),
          canResume: violationCount < 2, // Allow resume only if less than 2 violations
          resumeAvailableAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
        }
      }
    });

    logger.info(`Test session saved for user ${userId}, violations: ${violationCount}`);

    return res.status(200).json({
      success: true,
      message: 'Test session saved successfully',
      canResume: violationCount < 2,
      resumeAvailableAt: new Date(Date.now() + 10 * 60 * 1000)
    });
  } catch (error) {
    logger.error('Error saving test session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save test session',
    });
  }
};

/**
 * Resume test session 
 */
export const resumeTestSession = async (req: Request, res: Response) => {
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

    const testSession = (user as any).testSession;
    if (!testSession) {
      return res.status(404).json({
        success: false,
        message: 'No saved test session found',
      });
    }

    // Check if user can resume (within 10 minutes and less than 2 violations)
    const now = new Date();
    const resumeAvailableAt = new Date(testSession.resumeAvailableAt);
    
    if (!testSession.canResume) {
      return res.status(400).json({
        success: false,
        message: 'You have exceeded the maximum number of violations. Test cannot be resumed.',
      });
    }

    if (now < resumeAvailableAt) {
      const waitTime = Math.ceil((resumeAvailableAt.getTime() - now.getTime()) / (1000 * 60));
      return res.status(400).json({
        success: false,
        message: `Please wait ${waitTime} more minutes before resuming the test.`,
        waitTime
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Test session can be resumed',
      data: {
        currentQuestionIndex: testSession.currentQuestionIndex,
        answers: testSession.answers,
        timeRemaining: testSession.timeRemaining,
        violationCount: testSession.violationCount
      }
    });
  } catch (error) {
    logger.error('Error resuming test session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume test session',
    });
  }
};