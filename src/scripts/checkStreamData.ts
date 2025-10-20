import mongoose from 'mongoose';
import College from '../models/College';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function checkStreamData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get stream distribution
    const streamStats = await College.aggregate([
      { $group: { _id: '$stream', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n=== STREAM DISTRIBUTION ===');
    streamStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} colleges`);
    });

    // Get exam distribution for each stream
    const examStats = await College.aggregate([
      { $group: { _id: { stream: '$stream', exam: '$exam_accepted' }, count: { $sum: 1 } } },
      { $sort: { '_id.stream': 1, '_id.exam': 1 } }
    ]);

    console.log('\n=== EXAM DISTRIBUTION BY STREAM ===');
    examStats.forEach(stat => {
      console.log(`${stat._id.stream} - ${stat._id.exam}: ${stat.count} colleges`);
    });

    // Sample colleges from each stream
    const streams = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'];
    
    for (const stream of streams) {
      console.log(`\n=== ${stream} STREAM SAMPLES ===`);
      const samples = await College.find({ stream }).limit(3).select('name collegeType exam_accepted');
      samples.forEach(college => {
        console.log(`- ${college.name} (${college.collegeType}) - ${college.exam_accepted}`);
      });
    }

    console.log('\n=== TOTAL COLLEGES ===');
    const total = await College.countDocuments();
    console.log(`Total: ${total} colleges`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkStreamData();