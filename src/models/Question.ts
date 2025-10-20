import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  options: string[];
  correctOption: number;
  correctAnswer: string;
  explanation?: string;
  subject: 'math' | 'science' | 'english' | 'socialScience';
  difficulty: 'easy' | 'medium' | 'hard';
  class: number;
  topics: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(options: string[]) {
          return options.length === 4; // Ensure exactly 4 options
        },
        message: 'Questions must have exactly 4 options',
      },
    },
    correctOption: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      enum: ['math', 'science', 'english', 'socialScience'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'],
    },
    class: {
      type: Number,
      required: true,
      enum: [9, 10],
    },
    topics: [{
      type: String,
      required: true,
    }],
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', QuestionSchema);