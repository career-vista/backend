import mongoose, { Document, Schema } from 'mongoose';

export interface IBranch {
  name: string;
  closing_rank_min: number;
  closing_rank_max: number;
}

export interface ICollege extends Document {
  name: string;
  location: string;
  city?: string;
  state: string;
  type: 'government' | 'private' | 'deemed';
  collegeType: 'IIT' | 'NIT' | 'IIIT' | 'Medical' | 'Law' | 'Management' | 'Arts' | 'Other';
  stream: 'MPC' | 'BiPC' | 'MEC' | 'CEC' | 'HEC';
  exam_accepted: string;
  branches?: IBranch[];
  courses?: string[];
  closing_rank?: string; // For medical/law colleges
  closing_percentile?: string; // For management/arts colleges
  average_placement_lpa?: number;
  tuition_fees_total_lakhs?: number;
  fees_per_year?: string;
  internship_stipend?: string;
  pg_residency?: string;
  // Legacy fields for backward compatibility
  accreditation?: string;
  ranking?: number;
  streams?: string[];
  cutoffs?: Record<string, number>;
  fees?: {
    tuition: number;
    hostel?: number;
    other?: number;
  };
  facilities?: string[];
  website?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address: string;
  };
  admissionProcess?: string;
  scholarships?: string[];
  placements?: {
    averageCTC?: number;
    topCTC?: number;
    recruiters?: string[];
    placementPercentage?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  closing_rank_min: {
    type: Number,
    required: true,
  },
  closing_rank_max: {
    type: Number,
    required: true,
  },
});

const CollegeSchema = new Schema<ICollege>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['government', 'private', 'deemed'],
    },
    collegeType: {
      type: String,
      required: true,
      enum: ['IIT', 'NIT', 'IIIT', 'Medical', 'Law', 'Management', 'Arts', 'Other'],
    },
    stream: {
      type: String,
      required: true,
      enum: ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'],
    },
    exam_accepted: {
      type: String,
      required: true,
    },
    branches: [BranchSchema],
    courses: [String],
    closing_rank: String,
    closing_percentile: String,
    average_placement_lpa: Number,
    tuition_fees_total_lakhs: Number,
    fees_per_year: String,
    internship_stipend: String,
    pg_residency: String,
    // Legacy fields for backward compatibility
    accreditation: {
      type: String,
      trim: true,
    },
    ranking: {
      type: Number,
    },
    streams: [{
      type: String,
      enum: ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Law', 'Management'],
    }],
    cutoffs: {
      type: Map,
      of: Number,
    },
    fees: {
      tuition: Number,
      hostel: Number,
      other: Number,
    },
    facilities: [{
      type: String,
    }],
    website: {
      type: String,
      trim: true,
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
    },
    admissionProcess: {
      type: String,
    },
    scholarships: [{
      type: String,
    }],
    placements: {
      averageCTC: Number,
      topCTC: Number,
      recruiters: [String],
      placementPercentage: Number,
    },
  },
  { timestamps: true }
);

// Create indexes for common queries
CollegeSchema.index({ name: 'text', location: 'text' });
CollegeSchema.index({ state: 1 });
CollegeSchema.index({ stream: 1 });
CollegeSchema.index({ exam_accepted: 1 });
CollegeSchema.index({ collegeType: 1 });
CollegeSchema.index({ 'branches.closing_rank_min': 1 });
CollegeSchema.index({ 'branches.closing_rank_max': 1 });

export default mongoose.model<ICollege>('College', CollegeSchema);