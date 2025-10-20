import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../models/College';

// Load environment variables
dotenv.config({ path: '../../.env' });

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment variables.');
  process.exit(1);
}

async function showBiPCRanges() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const bipcColleges = await College.find({ stream: 'BiPC' });
    
    console.log('🏥 ALL BiPC COLLEGES WITH RANK RANGES:\n');
    
    const collegesWithRanges = bipcColleges.map(college => {
      const branch = college.branches?.[0];
      if (!branch) return null;
      return {
        name: college.name,
        minRank: branch.closing_rank_min,
        maxRank: branch.closing_rank_max
      };
    }).filter(Boolean).sort((a, b) => a.maxRank - b.maxRank);
    
    collegesWithRanges.forEach((college, index) => {
      console.log(`${index + 1}. ${college.name}: ${college.minRank}-${college.maxRank}`);
    });
    
    console.log(`\n📊 RANK RANGE SUMMARY:`);
    console.log(`Lowest max rank: ${Math.min(...collegesWithRanges.map(c => c.maxRank))}`);
    console.log(`Highest max rank: ${Math.max(...collegesWithRanges.map(c => c.maxRank))}`);
    console.log(`Total BiPC colleges: ${collegesWithRanges.length}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

showBiPCRanges();