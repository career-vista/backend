import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { importRealColleges } from './importRealColleges';
import { importRealScholarships } from './importRealScholarships';

export const importAllData = async () => {
  try {
    logger.info('Starting comprehensive data import...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista');
    logger.info('Connected to MongoDB');
    
    // Import real data
    logger.info('Importing real college data...');
    await importRealColleges();
    
    logger.info('Importing real scholarship data...');
    await importRealScholarships();
    
    logger.info('All data import completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    
  } catch (error) {
    logger.error('Error during data import:', error);
    throw error;
  }
};

// Run the import if this file is executed directly
if (require.main === module) {
  importAllData()
    .then(() => {
      logger.info('Comprehensive data import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Comprehensive data import failed:', error);
      process.exit(1);
    });
}


