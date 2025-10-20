import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment variables.');
  process.exit(1);
}

async function inspectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // List all collections
    const db = mongoose.connection.db;
    const collections = await db!.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(col => {
      console.log(` - ${col.name}`);
    });

    // Check if there are multiple college collections
    const collegeCollections = collections.filter(col => col.name.toLowerCase().includes('college'));
    console.log('College-related collections:', collegeCollections.map(c => c.name));

    // Count documents in each college collection
    for (const col of collegeCollections) {
      const count = await db!.collection(col.name).countDocuments();
      console.log(`${col.name}: ${count} documents`);
      
      // Get a sample document to see structure
      const sample = await db!.collection(col.name).findOne();
      if (sample) {
        console.log(`Sample from ${col.name}:`, JSON.stringify(sample, null, 2).substring(0, 300) + '...');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  inspectDatabase();
}