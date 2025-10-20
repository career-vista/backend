import mongoose, { Document, Schema } from 'mongoose';

export interface ILoan extends Document {
  name: string;
  provider: string;
  type: 'education' | 'career' | 'skill-development' | 'other';
  description: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    nationality?: string[];
    academicRequirements?: string;
    collateral?: boolean;
    cosigner?: boolean;
    other?: string;
  };
  amount: {
    min: number;
    max: number;
    currency: string;
  };
  interestRate: {
    type: 'fixed' | 'floating';
    rate: number;
    details?: string;
  };
  tenure: {
    min: number;
    max: number;
    unit: 'months' | 'years';
  };
  processingFee?: {
    amount?: number;
    percentage?: number;
  };
  repayment: {
    moratorium?: string;
    emi?: string;
    prepaymentPenalty?: string;
  };
  documents: string[];
  applicationProcess: string;
  website: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
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
    type: {
      type: String,
      required: true,
      enum: ['education', 'career', 'skill-development', 'other'],
    },
    description: {
      type: String,
      required: true,
    },
    eligibility: {
      minAge: Number,
      maxAge: Number,
      nationality: [String],
      academicRequirements: String,
      collateral: Boolean,
      cosigner: Boolean,
      other: String,
    },
    amount: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    interestRate: {
      type: {
        type: String,
        required: true,
        enum: ['fixed', 'floating'],
      },
      rate: {
        type: Number,
        required: true,
      },
      details: String,
    },
    tenure: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
        enum: ['months', 'years'],
      },
    },
    processingFee: {
      amount: Number,
      percentage: Number,
    },
    repayment: {
      moratorium: String,
      emi: String,
      prepaymentPenalty: String,
    },
    documents: [{
      type: String,
      required: true,
    }],
    applicationProcess: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
      trim: true,
    },
    contactInfo: {
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

// Create indexes for common queries
LoanSchema.index({ type: 1 });
LoanSchema.index({ provider: 1 });
LoanSchema.index({ 'amount.min': 1, 'amount.max': 1 });

export default mongoose.model<ILoan>('Loan', LoanSchema);