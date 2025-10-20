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

async function checkActualCounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('🔍 ACTUAL COLLEGE COUNTS PER STREAM+EXAM:\n');

    const streamExamCombos = [
      { stream: 'MPC', exam: 'JEE Main' },
      { stream: 'MPC', exam: 'JEE Advanced' },
      { stream: 'BiPC', exam: 'NEET' },
      { stream: 'MEC', exam: 'CUET' },
      { stream: 'MEC', exam: 'IPMAT' },
      { stream: 'CEC', exam: 'CLAT' },
      { stream: 'CEC', exam: 'CUET' },
      { stream: 'HEC', exam: 'CUET' }
    ];

    for (const combo of streamExamCombos) {
      const count = await College.countDocuments({
        stream: combo.stream,
        exam_accepted: combo.exam
      });
      
      console.log(`${combo.stream} + ${combo.exam}: ${count} colleges`);
      
      if (count > 0) {
        // Show sample colleges
        const samples = await College.find({
          stream: combo.stream,
          exam_accepted: combo.exam
        }).limit(3);
        
        console.log(`  Sample colleges:`);
        samples.forEach((college, index) => {
          console.log(`    ${index + 1}. ${college.name} (${college.collegeType})`);
        });
      }
      console.log('');
    }

    // Also check total by stream
    console.log('\n📊 TOTAL COLLEGES BY STREAM:');
    const streams = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'];
    
    for (const stream of streams) {
      const total = await College.countDocuments({ stream });
      const exams = await College.distinct('exam_accepted', { stream });
      console.log(`${stream}: ${total} total colleges across ${exams.length} exams`);
      console.log(`  Exams: ${exams.join(', ')}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkActualCounts();