import mongoose from 'mongoose';
import College from '../models/College';

// Comprehensive college data based on the text file
const allColleges = [
  // IITs (JEE Advanced)
  {
    name: 'Indian Institute of Technology Bombay',
    location: 'Mumbai, Maharashtra',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'government',
    accreditation: 'IIT',
    ranking: 1,
    courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EE', 'B.Tech ME', 'B.Tech CE', 'B.Tech Chemical'],
    streams: ['Engineering'],
    cutoffs: {
      'JEE Advanced CSE': 68,
      'JEE Advanced ECE': 350,
      'JEE Advanced EE': 975,
      'JEE Advanced ME': 2500,
      'JEE Advanced CE': 5250,
      'JEE Advanced Chemical': 2750
    },
    fees: {
      tuition: 122000,
      hostel: 50000,
      other: 30000,
      total: 202000
    },
    facilities: ['World-class labs', 'Central library', 'Sports complex', 'Hostels', 'Research centers'],
    website: 'https://www.iitb.ac.in',
    contactInfo: {
      address: 'Powai, Mumbai, Maharashtra 400076',
      email: 'info@iitb.ac.in',
      phone: '+91-22-2572-2545'
    },
    placements: {
      averageCTC: 2300000,
      topCTC: 4500000,
      placementPercentage: 95,
      recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey']
    }
  },
  {
    name: 'Indian Institute of Technology Madras',
    location: 'Chennai, Tamil Nadu',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'government',
    accreditation: 'IIT',
    ranking: 2,
    courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EE', 'B.Tech ME', 'B.Tech CE', 'B.Tech Chemical'],
    streams: ['Engineering'],
    cutoffs: {
      'JEE Advanced CSE': 116,
      'JEE Advanced ECE': 500,
      'JEE Advanced EE': 1250,
      'JEE Advanced ME': 3650,
      'JEE Advanced CE': 5000,
      'JEE Advanced Chemical': 3700
    },
    fees: {
      tuition: 150000,
      hostel: 50000,
      other: 30000,
      total: 230000
    },
    facilities: ['Advanced labs', 'Library', 'Sports facilities', 'Hostels', 'Research centers'],
    website: 'https://www.iitm.ac.in',
    contactInfo: {
      address: 'IIT P.O., Chennai, Tamil Nadu 600036',
      email: 'info@iitm.ac.in',
      phone: '+91-44-2257-8000'
    },
    placements: {
      averageCTC: 2300000,
      topCTC: 4200000,
      placementPercentage: 94,
      recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey']
    }
  },
  {
    name: 'Indian Institute of Technology Delhi',
    location: 'New Delhi, Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'government',
    accreditation: 'IIT',
    ranking: 3,
    courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EE', 'B.Tech ME', 'B.Tech CE', 'B.Tech Chemical'],
    streams: ['Engineering'],
    cutoffs: {
      'JEE Advanced CSE': 116,
      'JEE Advanced ECE': 450,
      'JEE Advanced EE': 1050,
      'JEE Advanced ME': 3150,
      'JEE Advanced CE': 5000,
      'JEE Advanced Chemical': 3000
    },
    fees: {
      tuition: 150000,
      hostel: 50000,
      other: 30000,
      total: 230000
    },
    facilities: ['Advanced labs', 'Library', 'Sports facilities', 'Hostels', 'Research centers'],
    website: 'https://www.iitd.ac.in',
    contactInfo: {
      address: 'Hauz Khas, New Delhi, Delhi 110016',
      email: 'info@iitd.ac.in',
      phone: '+91-11-2659-7135'
    },
    placements: {
      averageCTC: 2300000,
      topCTC: 4200000,
      placementPercentage: 94,
      recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey']
    }
  },
  // Add more IITs, NITs, IIITs, and Medical colleges...
  // This would include all 23 IITs, 31 NITs, 25 IIITs, and 25 Medical colleges from the text file
];

const importAllColleges = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista');
    console.log('Connected to MongoDB');

    // Clear existing colleges
    await College.deleteMany({});
    console.log('Cleared existing colleges');

    // Add all colleges
    await College.insertMany(allColleges);
    console.log(`Successfully imported ${allColleges.length} colleges`);

    // Create indexes
    await College.collection.createIndex({ name: 'text', location: 'text' });
    await College.collection.createIndex({ state: 1 });
    await College.collection.createIndex({ streams: 1 });
    await College.collection.createIndex({ ranking: 1 });
    console.log('Created indexes');

  } catch (error) {
    console.error('Error importing colleges:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the import
importAllColleges();
