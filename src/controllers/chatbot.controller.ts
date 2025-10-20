import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger';
import User from '../models/User';

// OpenRouter API configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Simple rate limiting - store last request time per IP
const requestTimestamps: Map<string, number> = new Map();
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  userContext?: {
    class?: '10' | '12';
    stream?: string;
    interests?: string[];
    previousChats?: ChatMessage[];
  };
}

// Enhanced system prompt that includes access to user data
const getSystemPrompt = (userClass: '10' | '12' = '12', stream?: string, hasTestResults = false, hasProfile = false) => {
  const basePersonality = `You are CareerVista AI, a warm, encouraging, and highly knowledgeable career counselor specializing in Indian education system. You help students make informed decisions about their academic and career paths.

PERSONALITY TRAITS:
- Supportive and understanding, like a caring mentor
- Enthusiastic about student potential
- Practical and realistic in advice
- Encouraging but honest about challenges
- Uses simple language students can understand
- Asks thoughtful follow-up questions

EXPERTISE AREAS:
- Indian education streams (MPC, BiPC, MEC, CEC, HEC)
- Entrance exams (JEE, NEET, CUET, CLAT, etc.)
- Career options and job market trends
- College selection and admission process
- Skill development and personality assessment
- Study planning and exam preparation`;

  const dataContext = hasTestResults && hasProfile 
    ? `
🎯 SPECIAL CAPABILITY - STREAM PREDICTION:
You have access to this student's test results and profile data. When they ask about stream recommendations or career guidance, you can offer to provide personalized stream predictions based on their actual performance and interests.

OFFER PHRASES TO USE:
- "Based on your test results, I can provide a detailed stream recommendation. Would you like me to analyze your performance?"
- "I see you've completed your academic test! I can give you personalized career guidance based on your scores. Interested?"
- "Your test results show some interesting patterns. Shall I provide a detailed analysis of which stream might be best for you?"

When offering predictions, be enthusiastic but not pushy. Let them know this is based on their actual data.`
    : hasTestResults 
    ? `
📊 You have access to this student's test results. You can offer to help them understand their performance and suggest next steps.`
    : hasProfile
    ? `
👤 You have access to this student's profile information. You can provide guidance based on their interests and background.`
    : `
📝 Encourage students to complete their profile and take the academic test for personalized recommendations.`;

  const classSpecificPrompt = userClass === '10' 
    ? `
CURRENT FOCUS - CLASS 10 STUDENT:
- Help choose the right stream for Class 11-12
- Explain different career paths available
- Assess interests and aptitudes
- Discuss subject combinations and their scope
- Address concerns about stream selection
- Provide guidance on skill development

STREAM OPTIONS TO DISCUSS:
- Science (PCM/PCB) → Engineering, Medical, Research
- Commerce → Business, Finance, Law, Management  
- Humanities → Literature, Psychology, Journalism, Civil Services`
    : `
CURRENT FOCUS - CLASS 12 STUDENT:
- College and course selection guidance
- Entrance exam preparation strategies
- Career planning based on chosen stream
- College admission process and requirements
- Backup options and alternative paths
- Industry insights and job market trends

${stream ? `STUDENT'S STREAM: ${stream}
Provide specific guidance based on their chosen stream and available opportunities.` : ''}`;

  return basePersonality + dataContext + classSpecificPrompt + `

CONVERSATION STYLE:
- Start with understanding their specific situation
- Ask relevant questions to provide personalized advice
- Share success stories and practical examples
- Be encouraging while being realistic
- Offer actionable next steps
- Remember previous conversation context
- When appropriate, offer to use their actual test/profile data for recommendations

IMPORTANT: Always be supportive, never judgmental, and focus on helping them discover their potential and make informed decisions.`;
};

export const chatWithCounselorBot = async (req: Request, res: Response) => {
  try {
    const { message, userContext }: ChatRequest = req.body;
    const userId = req.userId; // Get from auth middleware
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Rate limiting check
    const lastRequestTime = requestTimestamps.get(clientIP) || 0;
    const now = Date.now();
    
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      return res.status(429).json({
        success: false,
        message: 'Please wait a moment before sending another message.',
        error: 'RATE_LIMITED'
      });
    }
    
    requestTimestamps.set(clientIP, now);

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user data if authenticated
    let userData = null;
    let hasTestResults = false;
    let hasProfile = false;
    
    if (userId) {
      try {
        userData = await User.findById(userId);
        hasTestResults = !!(userData?.examCompleted && userData?.testScores?.fundamentals);
        hasProfile = !!userData?.profileCompleted;
      } catch (error) {
        logger.warn('Could not fetch user data for chat context:', error);
      }
    }

    // Build conversation history
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: getSystemPrompt(userContext?.class, userContext?.stream, hasTestResults, hasProfile)
      }
    ];

    // Add user context if available
    if (userData && (hasTestResults || hasProfile)) {
      let contextMessage = "STUDENT DATA CONTEXT:\n";
      
      if (hasProfile) {
        contextMessage += `Profile: Class ${userData.class}, Interests: ${userData.interests?.join(', ') || 'Not specified'}\n`;
        if (userData.state) contextMessage += `State: ${userData.state}\n`;
        if (userData.category) contextMessage += `Category: ${userData.category}\n`;
      }
      
      if (hasTestResults) {
        const testResults = userData.testScores!.fundamentals!;
        contextMessage += `Test Results: Total ${testResults.total}/100, Math: ${testResults.subjects.math}/25, Science: ${testResults.subjects.science}/25, English: ${testResults.subjects.english}/25, Social Science: ${testResults.subjects.socialScience}/25\n`;
        if (testResults.strengths?.length) contextMessage += `Strengths: ${testResults.strengths.join(', ')}\n`;
        if (testResults.weaknesses?.length) contextMessage += `Weaknesses: ${testResults.weaknesses.join(', ')}\n`;
      }
      
      if (userData.selectedStream) {
        contextMessage += `Predicted Stream: ${userData.selectedStream}\n`;
      }
      
      contextMessage += "\nUse this data to provide personalized guidance when relevant to the conversation.";
      
      messages.push({
        role: 'system',
        content: contextMessage
      });
    }

    // Add previous chat history if available
    if (userContext?.previousChats && userContext.previousChats.length > 0) {
      // Keep last 10 messages for context (excluding system messages)
      const recentHistory = userContext.previousChats
        .filter(msg => msg.role !== 'system')
        .slice(-10);
      messages.push(...recentHistory);
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    logger.info('🤖 Career counselor chat request:', {
      userId,
      userClass: userContext?.class,
      userStream: userContext?.stream,
      messageLength: message.length,
      historyLength: userContext?.previousChats?.length || 0,
      hasTestResults,
      hasProfile
    });

    // Call OpenRouter API with fallback models - All FREE tier
    const models = [
      'meta-llama/llama-3.3-70b-instruct:free', // Primary - Llama 3.3 70B (Most capable)
      'meta-llama/llama-3.1-8b-instruct:free', // Llama 3.1 8B
      'meta-llama/llama-3.2-3b-instruct:free', // Llama 3.2 3B
      'meta-llama/llama-3.2-1b-instruct:free', // Llama 3.2 1B (Fast)
      'mistralai/mistral-7b-instruct:free', // Mistral 7B
      'huggingface/zephyr-7b-beta:free', // Zephyr 7B
      'openchat/openchat-7b:free', // OpenChat 7B
      'gryphe/mythomist-7b:free', // Mythomist 7B
      'microsoft/phi-3-medium-128k-instruct:free', // Phi-3 Medium
      'microsoft/phi-3-mini-128k-instruct:free', // Phi-3 Mini
      'qwen/qwen-2-7b-instruct:free', // Qwen 2 7B
      'google/gemma-7b-it:free', // Gemma 7B
      'nousresearch/nous-capybara-7b:free', // Nous Capybara 7B
      'teknium/openhermes-2.5-mistral-7b:free' // OpenHermes Mistral 7B
    ];

    let response;
    let lastError;

    for (const model of models) {
      try {
        logger.info(`🤖 Trying model: ${model}`);
        
        response = await axios.post(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: model,
            messages: messages,
            max_tokens: 800,
            temperature: 0.7,
            stream: false
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://careervista.com',
              'X-Title': 'CareerVista AI Counselor'
            },
            timeout: 10000 // 10 second timeout
          }
        );
        
        // If we get here, the request was successful
        break;
        
      } catch (error: any) {
        lastError = error;
        logger.warn(`❌ Model ${model} failed:`, error.response?.status || error.message);
        
        // If it's a rate limit, try next model immediately
        if (error.response?.status === 429) {
          continue;
        }
        
        // If it's auth error, skip to next model
        if (error.response?.status === 401) {
          continue;
        }
        
        // For other errors, continue to next model
        continue;
      }
    }

    if (!response) {
      throw lastError || new Error('All AI models failed');
    }

    const aiResponse = response.data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI model');
    }

    logger.info('✅ Career counselor response generated successfully');

    res.status(200).json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString(),
        usage: response.data.usage || null,
        userHasTestResults: hasTestResults,
        userHasProfile: hasProfile,
        canProvidePersonalizedAdvice: hasTestResults && hasProfile
      }
    });

  } catch (error: any) {
    logger.error('❌ Career counselor chat error:', error);

    // Handle different types of errors with fallback responses
    if (error.response?.status === 429) {
      return res.status(200).json({
        success: true,
        data: {
          message: "I'm currently experiencing high demand! While you wait, here are some quick tips:\n\n• Focus on your strengths and interests when choosing streams\n• Research career prospects in different fields\n• Talk to professionals in areas that interest you\n• Consider both passion and practicality in your decisions\n\nPlease try asking your question again in a moment! 😊",
          timestamp: new Date().toISOString(),
          fallback: true
        }
      });
    }

    if (error.response?.status === 401) {
      return res.status(200).json({
        success: true,
        data: {
          message: "I'm having some technical difficulties, but I'm here to help! Here's some general career guidance:\n\n📚 **For Class 10 students:** Focus on understanding your interests in Science, Commerce, or Humanities\n\n🎓 **For Class 12 students:** Research entrance exams and college options in your chosen field\n\n💡 **Remember:** Every stream has excellent career opportunities. Choose based on your interests and aptitude!\n\nFeel free to ask specific questions about streams, careers, or colleges!",
          timestamp: new Date().toISOString(),
          fallback: true
        }
      });
    }

    // Generic fallback response
    const fallbackMessage = getFallbackResponse(req.body.message, req.body.userContext);
    
    res.status(200).json({
      success: true,
      data: {
        message: fallbackMessage,
        timestamp: new Date().toISOString(),
        fallback: true
      }
    });
  }
};

export const getPersonalizedRecommendation = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has completed both profile and test
    if (!user.profileCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile first to get personalized recommendations'
      });
    }

    if (!user.examCompleted || !user.testScores?.fundamentals) {
      return res.status(400).json({
        success: false,
        message: 'Please complete the academic test first to get personalized recommendations'
      });
    }

    const testResults = user.testScores.fundamentals;
    const profile = {
      interests: user.interests || [],
      class: user.class,
      state: user.state,
      category: user.category
    };

    // Generate recommendation message
    const recommendationMessage = `🎯 **Personalized Career Guidance Based on Your Profile & Test Results**

**📊 Your Performance Analysis:**
- Overall Score: ${testResults.total}/100 (${Math.round((testResults.total/100)*100)}%)
- Mathematics: ${testResults.subjects.math}/25 (${Math.round((testResults.subjects.math/25)*100)}%)
- Science: ${testResults.subjects.science}/25 (${Math.round((testResults.subjects.science/25)*100)}%)
- English: ${testResults.subjects.english}/25 (${Math.round((testResults.subjects.english/25)*100)}%)
- Social Science: ${testResults.subjects.socialScience}/25 (${Math.round((testResults.subjects.socialScience/25)*100)}%)

**🎯 Your Interests:** ${profile.interests.join(', ') || 'Not specified'}

**💡 Based on your data, I can provide:**
- Detailed stream recommendation with confidence analysis
- Career path suggestions aligned with your strengths
- Subject-wise improvement strategies
- College and entrance exam guidance
- Personalized study recommendations

Would you like me to provide a detailed analysis of which stream would be best for you? I can also explain the reasoning behind my recommendations! 

You can ask me things like:
- "What stream should I choose based on my test results?"
- "Analyze my test performance and suggest improvements"
- "What career options align with my interests and scores?"
- "Which entrance exams should I focus on?"

I'm here to help you make informed decisions about your academic future! 🚀`;

    res.status(200).json({
      success: true,
      data: {
        message: recommendationMessage,
        userProfile: {
          hasProfile: true,
          hasTestResults: true,
          totalScore: testResults.total,
          subjects: testResults.subjects,
          interests: profile.interests,
          class: profile.class
        },
        canProvideDetailed: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    logger.error('❌ Error getting personalized recommendation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personalized recommendation'
    });
  }
};

export const getCounselorSuggestions = async (req: Request, res: Response) => {
  try {
    const { userClass = '12', stream, interests = [] } = req.query;

    // Generate contextual conversation starters
    const suggestions = generateConversationStarters(
      userClass as '10' | '12',
      stream as string,
      interests as string[]
    );

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        welcomeMessage: getWelcomeMessage(userClass as '10' | '12', stream as string)
      }
    });

  } catch (error: any) {
    logger.error('❌ Error getting counselor suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
};

const generateConversationStarters = (userClass: '10' | '12', stream?: string, interests: string[] = []) => {
  const class10Starters = [
    "I'm confused about choosing the right stream for Class 11. Can you help?",
    "What career options do I have with Science stream?",
    "Is Commerce a good choice for future job prospects?",
    "I'm interested in technology. Which subjects should I take?",
    "How do I know if I'm suitable for medical field?"
  ];

  const class12Starters = [
    "Help me choose the right college for my stream",
    "What are the best entrance exams I should prepare for?",
    "I'm stressed about college admissions. Any advice?",
    "What are the job prospects in my field?",
    "Should I consider studying abroad?"
  ];

  const streamSpecificStarters: Record<string, string[]> = {
    'MPC': [
      "What are the different engineering branches I can choose?",
      "How competitive is JEE Main this year?",
      "Should I also consider other entrance exams besides JEE?"
    ],
    'BiPC': [
      "What's the competition like for NEET this year?",
      "Are there good career options in Biology besides MBBS?",
      "How should I prepare for medical entrance exams?"
    ],
    'MEC': [
      "What are the best business schools in India?",
      "Should I prepare for CUET or other management entrances?",
      "What career options do I have with Commerce and Math?"
    ],
    'CEC': [
      "How do I prepare for law entrance exams like CLAT?",
      "What are the different specializations in law?",
      "Is law a good career choice in current times?"
    ],
    'HEC': [
      "What are the career options with Humanities?",
      "How can I prepare for civil services exams?",
      "Are there good opportunities in media and journalism?"
    ]
  };

  let starters = userClass === '10' ? class10Starters : class12Starters;
  
  if (stream && streamSpecificStarters[stream]) {
    starters = [...starters.slice(0, 3), ...streamSpecificStarters[stream]];
  }

  return starters.slice(0, 5);
};

const getWelcomeMessage = (userClass: '10' | '12', stream?: string) => {
  const classContext = userClass === '10' 
    ? "I see you're in Class 10! This is such an exciting time to explore different career paths and choose your stream for the next phase."
    : "As a Class 12 student, you're at a crucial juncture for college selection and career planning.";

  const streamContext = stream 
    ? ` I notice you've chosen ${stream} stream - that opens up some fantastic opportunities!`
    : "";

  return `Hi there! 👋 I'm your CareerVista AI counselor, and I'm here to help you navigate your educational journey. ${classContext}${streamContext}

I can help you with:
🎯 Career guidance and stream selection
📚 College recommendations and entrance exam strategies  
💡 Industry insights and job market trends
📈 Personalized study and preparation plans

What would you like to discuss today? Feel free to ask me anything about your academic and career concerns!`;
};

// Fallback response generator when AI services are unavailable
const getFallbackResponse = (message: string, userContext?: any): string => {
  const lowerMessage = message.toLowerCase();
  
  // Stream-related questions
  if (lowerMessage.includes('stream') || lowerMessage.includes('subject')) {
    return `Great question about streams! Here's some guidance:

🔬 **MPC (Math, Physics, Chemistry):** Perfect for engineering, medicine (with Bio), technology careers
📊 **BiPC (Biology, Physics, Chemistry):** Ideal for medical field, biotechnology, research
💼 **MEC (Math, Economics, Commerce):** Excellent for business, finance, CA, management
⚖️ **CEC (Civics, Economics, Commerce):** Great for law, civil services, journalism
🎨 **HEC (History, Economics, Civics):** Perfect for humanities, social work, teaching

Consider your interests, strengths, and career goals when choosing!`;
  }

  // College-related questions
  if (lowerMessage.includes('college') || lowerMessage.includes('admission')) {
    return `Here's some college guidance:

🎯 **Research thoroughly:** Look into course curriculum, placement records, faculty
📊 **Entrance exams:** Prepare well for JEE, NEET, CUET, or relevant exams
🏛️ **College types:** Consider IITs, NITs, state colleges, private institutions
📍 **Location matters:** Think about distance from home, city opportunities
💰 **Financial planning:** Research fees, scholarships, and financial aid options

Start preparing early and keep multiple options open!`;
  }

  // Career-related questions
  if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('future')) {
    return `Let me share some career insights:

🚀 **Emerging fields:** AI/ML, Data Science, Digital Marketing, Renewable Energy
💼 **Traditional but strong:** Engineering, Medicine, Finance, Law, Teaching
🌟 **Key skills:** Problem-solving, communication, adaptability, continuous learning
📈 **Industry trends:** Technology integration across all fields, remote work opportunities

Focus on building both technical skills and soft skills for a successful career!`;
  }

  // General response
  return `I'm here to help with your educational and career planning! While I'm experiencing some technical issues, I can still offer guidance on:

📚 **Academic planning:** Stream selection, subject choices, study strategies
🎓 **College preparation:** Entrance exams, application process, college selection
💼 **Career guidance:** Industry insights, skill development, job market trends
🎯 **Goal setting:** Short-term and long-term academic and career objectives

What specific area would you like to discuss? I'm here to support your journey! 😊`;
};