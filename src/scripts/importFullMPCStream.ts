import mongoose from 'mongoose';
import { importMPCIITs } from './importMPCIITs';
import { importMPCNITs } from './importMPCNITs';
import { importMPCIIITs } from './importMPCIIITs';
import { logger } from '../utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careervista';

async function importFullMPCStream() {
  try {
    console.log('🚀 Starting Full MPC Stream Import...');
    console.log('====================================');

    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB for full MPC stream import');

    // Import all MPC sub-streams sequentially
    console.log('\n1️⃣ Importing IITs (JEE Advanced)...');
    await importMPCIITs();
    
    console.log('\n2️⃣ Importing NITs (JEE Main)...');
    await importMPCNITs();
    
    console.log('\n3️⃣ Importing IIITs (JEE Main)...');
    await importMPCIIITs();

    console.log('\n✅ FULL MPC STREAM IMPORT COMPLETED!');
    console.log('=====================================');
    console.log('📊 Summary:');
    console.log('   🏛️ IITs: 22 colleges (JEE Advanced)');
    console.log('   🏛️ NITs: 30 colleges (JEE Main)');
    console.log('   🏛️ IIITs: 25 colleges (JEE Main)');
    console.log('   📈 Total: 77 MPC Stream Colleges');
    console.log('   🎯 Stream: MPC (Physics, Chemistry, Mathematics)');
    console.log('   📝 Exams: JEE Advanced, JEE Main');
    console.log('   🎓 Branches: CSE, ECE, EEE, MECH, CIVIL, IT, AI+DS, etc.');

    process.exit(0);

  } catch (error) {
    logger.error('Error importing full MPC stream:', error);
    console.error('❌ Failed to import full MPC stream:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  importFullMPCStream();
}

export { importFullMPCStream };