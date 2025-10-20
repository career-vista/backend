import mongoose, { Document, Schema } from 'mongoose';

export interface IScholarship extends Document {
  id: string;
  name: string;
  provider: string;
  amount: number;
  type: 'Merit' | 'Need-based' | 'Category' | 'State' | 'Central' | 'Private';
  sector?: 'Government' | 'Corporate' | 'Private';
  eligibility: {
    minPercentage: number;
    categories: string[];
    incomeLimit?: number;
    states?: string[];
    courses: string[];
    gender?: string;
    pwd?: boolean;
  };
  applicationDeadline: string;
  description: string;
  website: string;
  documentsRequired: string[];
  renewalCriteria?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScholarshipSchema = new Schema<IScholarship>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      enum: ['Merit', 'Need-based', 'Category', 'State', 'Central', 'Private'],
    },
    sector: {
      type: String,
      enum: ['Government', 'Corporate', 'Private'],
    },
    eligibility: {
      minPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      categories: [{
        type: String,
        required: true,
      }],
      incomeLimit: {
        type: Number,
        min: 0,
      },
      states: [String],
      courses: [{
        type: String,
        required: true,
      }],
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
      },
      pwd: {
        type: Boolean,
        default: false,
      },
    },
    applicationDeadline: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
      trim: true,
    },
    documentsRequired: [{
      type: String,
      required: true,
    }],
    renewalCriteria: {
      type: String,
    },
  },
  { 
    timestamps: true,
    toJSON: { 
      transform: (doc, ret) => {
        ret.id = (ret._id as mongoose.Types.ObjectId).toString();
        delete ret._id;
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

// Create indexes for efficient querying
ScholarshipSchema.index({ type: 1 });
ScholarshipSchema.index({ sector: 1 });
ScholarshipSchema.index({ 'eligibility.categories': 1 });
ScholarshipSchema.index({ 'eligibility.states': 1 });
ScholarshipSchema.index({ 'eligibility.courses': 1 });
ScholarshipSchema.index({ amount: 1 });
ScholarshipSchema.index({ applicationDeadline: 1 });
ScholarshipSchema.index({ name: 'text', description: 'text', provider: 'text' });

export default mongoose.model<IScholarship>('Scholarship', ScholarshipSchema);