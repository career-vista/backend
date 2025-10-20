import { logger } from './logger'

// Lazy-load OpenAI only when an API key is present to avoid ESM/CJS and env issues
async function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  const mod = await import('openai')
  const OpenAI = mod.default as any
  return new OpenAI({ apiKey })
}

// Central AI config and helpers
const AI_CONFIG = {
  enabled: (process.env.AI_ENABLED ?? 'true') !== 'false',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  temperature: 0.2,
  timeoutMs: Number(process.env.AI_TIMEOUT_MS || 15000),
  maxRetries: Number(process.env.AI_MAX_RETRIES || 2),
}

function safeJsonParse(input: string): any | null {
  try {
    return JSON.parse(input)
  } catch {
    return null
  }
}

function extractJsonBlock(text: string): string | null {
  if (!text) return null
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) return text.slice(start, end + 1)
  return null
}

async function withRetry<T = any>(fn: () => Promise<T>): Promise<T> {
  let lastErr: any
  for (let attempt = 0; attempt <= AI_CONFIG.maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs)
      const result = await fn()
      clearTimeout(timer)
      return result
    } catch (err: any) {
      lastErr = err
      if (attempt === AI_CONFIG.maxRetries) break
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)))
    }
  }
  throw lastErr
}

export type StreamRecInput = {
  classLevel: '10th' | '12th'
  scores?: {
    math?: number
    science?: number
    english?: number
    socialScience?: number
  }
  interests?: string[]
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS'
  state?: string
}

export type StreamRec = {
  stream: 'MPC' | 'BiPC' | 'MEC' | 'CEC' | 'HEC'
  confidence: number
  rationale: string
  strengths?: string[]
  weaknesses?: string[]
  fitScore?: number
  careerAlignment?: string
  subjectAnalysis?: {
    [key: string]: {
      score: number
      feedback: string
    }
  }
}

export async function getAIStreamRecommendations(input: StreamRecInput): Promise<StreamRec[]> {
  const system = `You are CareerVista AI, an expert counselor for Indian students (2025). Provide comprehensive stream recommendations for 10th graders with detailed fit analysis.

Your task:
1. Analyze the student's academic test scores and interests
2. Rank Science (MPC/BiPC), Commerce (MEC), and Humanities (CEC/HEC) streams by fit score
3. Provide detailed strengths/weaknesses analysis for each stream
4. Give specific feedback on why each stream is suitable/unsuitable

Constraints:
- Use 2025 realities: 70% stream regret, 57% unemployability, affordability concerns
- Consider category/quota impacts but focus on aptitude + interests
- For 10th graders, emphasize fundamentals over current performance
- Provide actionable insights to help students make informed choices
- Confidence must be 0-100 (fit score)
- Include specific subject-wise analysis

Output strict JSON format:
{
  "recommendations": [
    {
      "stream": "MPC",
      "confidence": 88,
      "rationale": "Strong mathematical and scientific aptitude with excellent problem-solving skills",
      "strengths": ["Advanced mathematics", "Physics concepts", "Logical reasoning"],
      "weaknesses": ["Biology concepts", "Memorization skills"],
      "fitScore": 88,
      "careerAlignment": "Engineering, Technology, Research",
      "subjectAnalysis": {
        "mathematics": {"score": 85, "feedback": "Excellent numerical reasoning"},
        "physics": {"score": 82, "feedback": "Strong conceptual understanding"},
        "chemistry": {"score": 78, "feedback": "Good but needs improvement in organic chemistry"}
      }
    }
  ]
}`

  const user = `INPUT\nclassLevel: ${input.classLevel}\nstate: ${input.state || 'NA'}\ncategory: ${input.category || 'NA'}\nscores: ${JSON.stringify(input.scores || {})}\ninterests: ${(input.interests || []).join(', ')}`

  try {
    const openai = await getOpenAIClient()
    // If OpenAI is not configured, provide a simple deterministic fallback
    if (!openai) {
      logger.warn('OPENAI_API_KEY missing. Using fallback recommendations.')
      const scores = input.scores || {}
      const interests = (input.interests || []).map((s) => s.toLowerCase())
      const picks: StreamRec[] = []
      // Basic heuristics
      const math = Number(scores.math || 0)
      const science = Number(scores.science || 0)
      const english = Number(scores.english || 0)
      const sst = Number(scores.socialScience || 0)
      if (math >= 70 && science >= 70) picks.push({ 
        stream: 'MPC', 
        confidence: Math.min(95, Math.round((math + science) / 2)), 
        rationale: 'Strong math and science fundamentals with excellent problem-solving abilities.',
        strengths: ['Mathematical reasoning', 'Scientific thinking', 'Logical analysis'],
        weaknesses: ['Memorization', 'Biology concepts'],
        fitScore: Math.min(95, Math.round((math + science) / 2)),
        careerAlignment: 'Engineering, Technology, Research, Medicine'
      })
      if (interests.some((i) => ['biology','medical','doctor','health'].some(k=>i.includes(k)))) picks.push({ 
        stream: 'BiPC', 
        confidence: 80, 
        rationale: 'Interests aligned with biology/medical fields with strong scientific aptitude.',
        strengths: ['Biology interest', 'Medical aptitude', 'Scientific curiosity'],
        weaknesses: ['Physics concepts', 'Advanced mathematics'],
        fitScore: 80,
        careerAlignment: 'Medicine, Biotechnology, Research, Healthcare'
      })
      if (math >= 60 && english >= 60) picks.push({ 
        stream: 'MEC', 
        confidence: Math.round((math + english) / 2), 
        rationale: 'Good numerical and verbal aptitude suitable for commerce and business.',
        strengths: ['Numerical skills', 'Communication', 'Business thinking'],
        weaknesses: ['Advanced science', 'Memorization'],
        fitScore: Math.round((math + english) / 2),
        careerAlignment: 'Business, Finance, Accounting, Management'
      })
      if (english >= 70 && sst >= 70) picks.push({ 
        stream: 'CEC', 
        confidence: Math.round((english + sst) / 2), 
        rationale: 'Strong humanities/communication foundation with creative potential.',
        strengths: ['Communication', 'Critical thinking', 'Creative expression'],
        weaknesses: ['Advanced mathematics', 'Scientific concepts'],
        fitScore: Math.round((english + sst) / 2),
        careerAlignment: 'Journalism, Law, Social Sciences, Arts'
      })
      if (picks.length < 3) picks.push({ 
        stream: 'HEC', 
        confidence: 65, 
        rationale: 'Balanced profile with potential to excel in humanities with proper guidance.',
        strengths: ['Balanced skills', 'Adaptability', 'Broad interests'],
        weaknesses: ['Specialized focus', 'Advanced concepts'],
        fitScore: 65,
        careerAlignment: 'General Arts, Social Work, Education, Public Service'
      })
      return picks.slice(0, 3)
    }
    if (!AI_CONFIG.enabled) throw new Error('AI disabled via env')
    const resp: any = await withRetry(() => openai.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: AI_CONFIG.temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    }))

    const content = resp.choices?.[0]?.message?.content || ''
    const jsonText = extractJsonBlock(content) || content
    const parsed = safeJsonParse(jsonText) || { recommendations: [] }
    const recs: StreamRec[] = (parsed.recommendations || []).map((r: any) => ({
      stream: r.stream,
      confidence: Math.max(0, Math.min(100, Number(r.confidence) || 0)),
      rationale: String(r.rationale || ''),
      strengths: r.strengths || [],
      weaknesses: r.weaknesses || [],
      fitScore: Math.max(0, Math.min(100, Number(r.fitScore) || r.confidence)),
      careerAlignment: String(r.careerAlignment || ''),
      subjectAnalysis: r.subjectAnalysis || {}
    }))
    return recs.slice(0, 3)
  } catch (error) {
    logger.error('OpenAI stream recommendations failed', error)
    // Fallback to simple heuristic on error as well
    const scores = input.scores || {}
    const math = Number(scores.math || 0)
    const science = Number(scores.science || 0)
    const english = Number(scores.english || 0)
    const sst = Number(scores.socialScience || 0)
    const picks: StreamRec[] = []
    if (math >= 70 && science >= 70) picks.push({ 
      stream: 'MPC', 
      confidence: Math.min(95, Math.round((math + science) / 2)), 
      rationale: 'Strong math and science fundamentals with excellent problem-solving abilities.',
      strengths: ['Mathematical reasoning', 'Scientific thinking', 'Logical analysis'],
      weaknesses: ['Memorization', 'Biology concepts'],
      fitScore: Math.min(95, Math.round((math + science) / 2)),
      careerAlignment: 'Engineering, Technology, Research, Medicine'
    })
    if (math >= 60 && english >= 60) picks.push({ 
      stream: 'MEC', 
      confidence: Math.round((math + english) / 2), 
      rationale: 'Good numerical and verbal aptitude suitable for commerce and business.',
      strengths: ['Numerical skills', 'Communication', 'Business thinking'],
      weaknesses: ['Advanced science', 'Memorization'],
      fitScore: Math.round((math + english) / 2),
      careerAlignment: 'Business, Finance, Accounting, Management'
    })
    if (english >= 70 && sst >= 70) picks.push({ 
      stream: 'CEC', 
      confidence: Math.round((english + sst) / 2), 
      rationale: 'Strong humanities/communication foundation with creative potential.',
      strengths: ['Communication', 'Critical thinking', 'Creative expression'],
      weaknesses: ['Advanced mathematics', 'Scientific concepts'],
      fitScore: Math.round((english + sst) / 2),
      careerAlignment: 'Journalism, Law, Social Sciences, Arts'
    })
    if (picks.length === 0) picks.push({ 
      stream: 'HEC', 
      confidence: 60, 
      rationale: 'Balanced profile with potential to excel in humanities with proper guidance.',
      strengths: ['Balanced skills', 'Adaptability', 'Broad interests'],
      weaknesses: ['Specialized focus', 'Advanced concepts'],
      fitScore: 60,
      careerAlignment: 'General Arts, Social Work, Education, Public Service'
    })
    return picks.slice(0, 3)
  }
}

/**
 * Generate AI-powered interest suggestions based on user responses
 */
export async function generateAIInterests(input: any): Promise<string[]> {
  const system = `You are CareerVista AI, an expert at identifying student interests from responses. Generate 5-8 relevant interests based on user data.
Constraints:
- Focus on academic subjects, career domains, and activity preferences
- Use Indian education context (CBSE/ICSE/State boards)
- Consider class level, academic performance, and any provided responses
- Output as JSON array: ["interest1", "interest2", ...]
- Interests should be specific and actionable (e.g., "Mathematics Problem Solving", "Creative Writing", "Laboratory Research")`

  const user = `INPUT:
Class: ${input.userClass || 'NA'}
Board: ${input.board || 'NA'}
State: ${input.state || 'NA'}
Category: ${input.category || 'NA'}
Gender: ${input.gender || 'NA'}
Existing Interests: ${(input.existingInterests || []).join(', ') || 'None'}
Academic Performance: ${JSON.stringify(input.academicPerformance || {})}
Quick Responses: ${JSON.stringify(input.responses || [])}`

  try {
    const openai = await getOpenAIClient()
    if (!openai) {
      logger.warn('OPENAI_API_KEY missing. Using fallback interests.')
      return [
        'Mathematics',
        'Science Research',
        'Creative Writing',
        'Technology',
        'Social Sciences',
      ]
    }
    if (!AI_CONFIG.enabled) throw new Error('AI disabled via env')
    const resp: any = await withRetry(() => openai.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    }))

    const content = resp.choices?.[0]?.message?.content || ''
    const start = content.indexOf('[')
    const end = content.lastIndexOf(']')
    const jsonText = start >= 0 && end > start ? content.slice(start, end + 1) : '[]'
    const parsed = safeJsonParse(jsonText) || []
    
    return Array.isArray(parsed) ? parsed.slice(0, 8) : []
  } catch (error) {
    logger.error('OpenAI interest generation failed', error)
    // Fallback to basic interests
    return [
      'Mathematics',
      'Science Research',
      'Creative Writing',
      'Technology',
      'Social Sciences',
    ]
  }
}

/**
 * Generate college predictions based on entrance scores and preferences
 */
export async function getCollegePredictions(input: {
  entranceScores: any[];
  category: string;
  state: string;
  preferences: any;
}): Promise<any[]> {
  const system = `You are CareerVista AI, expert in Indian college admissions (2025). Predict college admission chances based on entrance scores.
Constraints:
- Use 2025 cutoffs for JEE/NEET/EAMCET/CLAT/CUET
- Consider category quotas (General/OBC/SC/ST/EWS)
- Factor in home state vs other state quotas
- Classify as Ambitious (30% chance), Moderate (70% chance), Safe (90% chance)
- Include fee structure and placement data
- Output JSON: { "predictions": [{ "college": "...", "course": "...", "category": "Safe/Moderate/Ambitious", "fees": "...", "placement": "..." }] }`

  const user = `INPUT:
Entrance Scores: ${JSON.stringify(input.entranceScores)}
Category: ${input.category}
State: ${input.state}
Preferences: ${JSON.stringify(input.preferences)}`

  try {
    const openai = await getOpenAIClient()
    if (!openai) {
      logger.warn('OPENAI_API_KEY missing. Returning empty college predictions.')
      return []
    }
    if (!AI_CONFIG.enabled) throw new Error('AI disabled via env')
    const resp: any = await withRetry(() => openai.chat.completions.create({
      model: AI_CONFIG.model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    }))

    const content = resp.choices?.[0]?.message?.content || ''
    const jsonText = extractJsonBlock(content) || '{}'
    const parsed = safeJsonParse(jsonText) || { predictions: [] }
    
    return parsed.predictions || []
  } catch (error) {
    logger.error('OpenAI college predictions failed', error)
    return []
  }
}


