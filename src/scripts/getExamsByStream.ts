import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function getExamsByStream() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get exam distribution for each stream
    const examStats = await College.aggregate([
      { $group: { _id: { stream: '$stream', exam: '$exam_accepted' }, count: { $sum: 1 } } },
      { $sort: { '_id.stream': 1, '_id.exam': 1 } }
    ]);

    console.log('\n=== AVAILABLE EXAMS BY STREAM (for Frontend) ===');
    
    const streamExams = {
      MPC: [],
      BiPC: [],
      MEC: [],
      CEC: [],
      HEC: []
    };

    examStats.forEach(stat => {
      const stream = stat._id.stream;
      const exam = stat._id.exam;
      const count = stat.count;
      
      if (streamExams[stream]) {
        streamExams[stream].push({ exam, count });
      }
    });

    // Generate frontend configuration
    console.log('\n=== FRONTEND EXAM CONFIGURATION ===');
    Object.keys(streamExams).forEach(stream => {
      console.log(`\n${stream} Stream:`);
      streamExams[stream].forEach(item => {
        console.log(`  - ${item.exam} (${item.count} colleges)`);
      });
    });

    // Generate the exact object for frontend
    console.log('\n=== COPY THIS TO FRONTEND ===');
    const frontendConfig = {};
    Object.keys(streamExams).forEach(stream => {
      frontendConfig[stream] = streamExams[stream].map(item => item.exam);
    });
    
    console.log(JSON.stringify(frontendConfig, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

getExamsByStream();