import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function checkBiPCStructure() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const aiims = await College.findOne({ name: 'AIIMS Delhi' });
    console.log('🏥 AIIMS Delhi structure:');
    console.log('closing_rank:', aiims?.closing_rank);
    console.log('branches:');
    console.log(JSON.stringify(aiims?.branches, null, 2));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkBiPCStructure();