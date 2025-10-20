import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  profileCompleted: boolean;
  examCompleted: boolean;
  examDate?: Date;
  class?: number;
  board?: string;
  state?: string; 
  category?: string;
  gender?: string;
  income?: number;
  interests?: string[];
  
  // Academic Records
  // Removed class10Marks and class12Details as they're not in actual MongoDB record
  
  entranceScores?: {
    examName: string;
    score: number;
    rank?: number;
    percentile?: number;
    year: number;
  }[];
  
  testScores?: {
    fundamentals?: {
      total: number;
      subjects: {
        math: number;
        science: number;
        english: number;
        socialScience: number;
      };
      weaknesses: string[];
      strengths: string[];
      date: Date;
      timeTaken: number;
    };
    adaptiveTest?: {
      questions: string[];
      answers: string[];
      score: number;
      difficulty: string;
      date: Date;
    };
  };

  // Test session for handling fullscreen violations and resume functionality
  testSession?: {
    currentQuestionIndex: number;
    answers: any[];
    timeRemaining: number;
    violationCount: number;
    lastSaved: Date;
    canResume: boolean;
    resumeAvailableAt: Date;
  };
  
  // Latest college prediction summary for dashboard display
  lastCollegePredictionSummary?: {
    ambitiousCount: number;
    moderateCount: number;
    safeCount: number;
    examTypes: string[];
  };
  
  collegePreferences?: {
    preferredColleges: string[];
    budgetRange: {
      min: number;
      max: number;
    };
    locationPreference: string[];
    coursePreferences: string[];
  };
  selectedStream?: 'MPC' | 'BiPC' | 'MEC' | 'CEC' | 'HEC';
  // fundamentalsTest10 removed - redundant with testScores.fundamentals
  
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default in queries
    },
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    examCompleted: {
      type: Boolean,
      default: false,
    },
    examDate: {
      type: Date,
    },
    class: {
      type: Number,
      enum: [9, 10, 11, 12],
    },
    board: {
      type: String,
      enum: ['CBSE', 'ICSE', 'State Board', 'Other'],
    },
    state: {
      type: String,
    },
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    income: {
      type: Number,
      min: 0,
    },
    interests: [{
      type: String,
    }],
    
    // Academic Records removed - not in actual MongoDB record
    
    entranceScores: [{
      examName: {
        type: String,
        enum: ['JEE Main', 'JEE Advanced', 'NEET', 'EAMCET', 'CLAT', 'CUET', 'Other'],
      },
      score: Number,
      rank: Number,
      percentile: Number,
      year: Number,
    }],
    
    testScores: {
      fundamentals: {
        total: Number,
        subjects: {
          math: Number,
          science: Number,
          english: Number,
          socialScience: Number,
        },
        weaknesses: [String],
        strengths: [String],
        date: Date,
        timeTaken: Number,
      },
      adaptiveTest: {
        questions: [String],
        answers: [String],
        score: Number,
        difficulty: {
          type: String,
          enum: ['Easy', 'Medium', 'Hard'],
        },
        date: Date,
      },
    },

    testSession: {
      currentQuestionIndex: Number,
      answers: [Schema.Types.Mixed],
      timeRemaining: Number,
      violationCount: { type: Number, default: 0 },
      lastSaved: Date,
      canResume: { type: Boolean, default: true },
      resumeAvailableAt: Date,
    },

    lastCollegePredictionSummary: {
      ambitiousCount: { type: Number, default: 0 },
      moderateCount: { type: Number, default: 0 },
      safeCount: { type: Number, default: 0 },
      examTypes: { type: [String], default: [] },
    },
    
    collegePreferences: {
      preferredColleges: [String],
      budgetRange: {
        min: Number,
        max: Number,
      },
      locationPreference: [String],
      coursePreferences: [String],
    },
    selectedStream: {
      type: String,
      enum: ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'],
    },
    // fundamentalsTest10 removed - redundant with testScores.fundamentals
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);