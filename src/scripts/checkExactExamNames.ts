import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function checkExactExamNames() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('🔍 EXACT EXAM NAMES IN DATABASE:\n');

    const streams = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'];
    
    for (const stream of streams) {
      console.log(`=== ${stream} STREAM ===`);
      
      const examNames = await College.distinct('exam_accepted', { stream });
      console.log(`Exact exam names:`);
      examNames.forEach((exam, index) => {
        console.log(`  ${index + 1}. "${exam}"`);
      });
      
      // Count colleges for each exam
      for (const exam of examNames) {
        const count = await College.countDocuments({ stream, exam_accepted: exam });
        console.log(`     -> ${count} colleges`);
      }
      console.log('');
    }

    console.log('\n🚀 FRONTEND VS DATABASE COMPARISON:');
    console.log('Frontend sends:     Database has:');
    console.log('---------------     -------------');
    
    const frontendExams = {
      'MPC': ['JEE Main', 'JEE Advanced'],
      'BiPC': ['NEET'],
      'MEC': ['CUET', 'IPMAT'],
      'CEC': ['CLAT', 'CUET'],
      'HEC': ['CUET']
    };

    for (const [stream, frontendExamList] of Object.entries(frontendExams)) {
      console.log(`\n${stream}:`);
      const dbExams = await College.distinct('exam_accepted', { stream });
      
      for (const frontendExam of frontendExamList) {
        const exactMatch = dbExams.find(dbExam => dbExam === frontendExam);
        const partialMatch = dbExams.find(dbExam => dbExam.toLowerCase().includes(frontendExam.toLowerCase()));
        
        if (exactMatch) {
          console.log(`  "${frontendExam}" -> ✅ EXACT MATCH: "${exactMatch}"`);
        } else if (partialMatch) {
          console.log(`  "${frontendExam}" -> 🟡 PARTIAL MATCH: "${partialMatch}"`);
        } else {
          console.log(`  "${frontendExam}" -> ❌ NO MATCH`);
          console.log(`    Available: ${dbExams.join(', ')}`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkExactExamNames();