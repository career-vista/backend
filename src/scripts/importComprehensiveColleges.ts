import mongoose from 'mongoose';
import College from '../models/College';

// Comprehensive college data from the text file
const comprehensiveColleges = [
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
      other: 30000
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
      other: 30000
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
      other: 30000
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
  {
    name: 'Indian Institute of Technology Kanpur',
    location: 'Kanpur, Uttar Pradesh',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'government',
    accreditation: 'IIT',
    ranking: 4,
    courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EE', 'B.Tech ME', 'B.Tech CE', 'B.Tech Chemical'],
    streams: ['Engineering'],
    cutoffs: {
      'JEE Advanced CSE': 210,
      'JEE Advanced ECE': 500,
      'JEE Advanced EE': 900,
      'JEE Advanced ME': 3100,
      'JEE Advanced CE': 5250,
      'JEE Advanced Chemical': 3150
    },
    fees: {
      tuition: 150000,
      hostel: 50000,
      other: 30000
    },
    facilities: ['Advanced labs', 'Library', 'Sports facilities', 'Hostels', 'Research centers'],
    website: 'https://www.iitk.ac.in',
    contactInfo: {
      address: 'Kalyanpur, Kanpur, Uttar Pradesh 208016',
      email: 'info@iitk.ac.in',
      phone: '+91-512-259-7000'
    },
    placements: {
      averageCTC: 1900000,
      topCTC: 3800000,
      placementPercentage: 92,
      recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey']
    }
  },
  {
    name: 'Indian Institute of Technology Kharagpur',
    location: 'Kharagpur, West Bengal',
    city: 'Kharagpur',
    state: 'West Bengal',
    type: 'government',
    accreditation: 'IIT',
    ranking: 5,
    courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EE', 'B.Tech ME', 'B.Tech CE', 'B.Tech Chemical'],
    streams: ['Engineering'],
    cutoffs: {
      'JEE Advanced CSE': 350,
      'JEE Advanced ECE': 950,
      'JEE Advanced EE': 1750,
      'JEE Advanced ME': 3750,
      'JEE Advanced CE': 8500,
      'JEE Advanced Chemical': 3500
    },
    fees: {
      tuition: 120000,
      hostel: 50000,
      other: 30000
    },
    facilities: ['Advanced labs', 'Library', 'Sports facilities', 'Hostels', 'Research centers'],
    website: 'https://www.iitkgp.ac.in',
    contactInfo: {
      address: 'Kharagpur, West Bengal 721302',
      email: 'info@iitkgp.ac.in',
      phone: '+91-3222-255-221'
    },
    placements: {
      averageCTC: 1600000,
      topCTC: 3200000,
      placementPercentage: 90,
      recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey']
    }
  },
  // Continue with more IITs...
  {
    name: 'Indian Institute of Technology Roorkee',
    location: 'Roorkee, Uttarakhand',
    city: 'Roorkee',
    state: 'Uttarakhand',
    type: 'government',
    accreditation: 'IIT',
    ranking: 6,
    courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EE', 'B.Tech ME', 'B.Tech CE', 'B.Tech Chemical'],
    streams: ['Engineering'],
    cutoffs: {
      'JEE Advanced CSE': 275,
      'JEE Advanced ECE': 850,
      'JEE Advanced EE': 1750,
      'JEE Advanced ME': 3750,
      'JEE Advanced CE': 7500,
      'JEE Advanced Chemical': 3250
    },
    fees: {
      tuition: 120000,
      hostel: 50000,
      other: 30000
    },
    facilities: ['Advanced labs', 'Library', 'Sports facilities', 'Hostels', 'Research centers'],
    website: 'https://www.iitr.ac.in',
    contactInfo: {
      address: 'Roorkee, Uttarakhand 247667',
      email: 'info@iitr.ac.in',
      phone: '+91-1332-285-311'
    },
    placements: {
      averageCTC: 1500000,
      topCTC: 3000000,
      placementPercentage: 88,
      recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey']
    }
  },
  // NITs (JEE Main)
  {
    name: 'National Institute of Technology Tiruchirappalli',
    location: 'Tiruchirappalli, Tamil Nadu',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    type: 'government',
    accreditation: 'NIT',
    ranking: 8,
    courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EE', 'B.Tech ME', 'B.Tech CE'],
    streams: ['Engineering'],
    cutoffs: {
      'JEE Main CSE': 1350,
      'JEE Main ECE': 2500,
      'JEE Main EE': 4000,
      'JEE Main ME': 7250,
      'JEE Main CE': 8500
    },
    fees: {
      tuition: 62000,
      hostel: 50000,
      other: 20000
    },
    facilities: ['Modern labs', 'Library', 'Sports', 'Hostels', 'Research centers'],
    website: 'https://www.nitt.edu',
    contactInfo: {
      address: 'Tiruchirappalli, Tamil Nadu 620015',
      email: 'info@nitt.edu',
      phone: '+91-431-250-3000'
    },
    placements: {
      averageCTC: 1300000,
      topCTC: 3000000,
      placementPercentage: 88,
      recruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture']
    }
  },
  {
    name: 'National Institute of Technology Karnataka',
    location: 'Surathkal, Karnataka',
    city: 'Surathkal',
    state: 'Karnataka',
    type: 'government',
    accreditation: 'NIT',
    ranking: 9,
    courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EE', 'B.Tech ME', 'B.Tech CE'],
    streams: ['Engineering'],
    cutoffs: {
      'JEE Main CSE': 1500,
      'JEE Main ECE': 2850,
      'JEE Main EE': 4500,
      'JEE Main ME': 7750,
      'JEE Main CE': 9250
    },
    fees: {
      tuition: 62000,
      hostel: 50000,
      other: 20000
    },
    facilities: ['Modern labs', 'Library', 'Sports', 'Hostels', 'Research centers'],
    website: 'https://www.nitk.ac.in',
    contactInfo: {
      address: 'Surathkal, Karnataka 575025',
      email: 'info@nitk.ac.in',
      phone: '+91-824-247-4000'
    },
    placements: {
      averageCTC: 1200000,
      topCTC: 2800000,
      placementPercentage: 85,
      recruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture']
    }
  },
  // IIITs
  {
    name: 'International Institute of Information Technology Hyderabad',
    location: 'Hyderabad, Telangana',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'deemed',
    accreditation: 'IIIT',
    ranking: 10,
    courses: ['B.Tech CSE', 'B.Tech ECE'],
    streams: ['Engineering'],
    cutoffs: {
      'JEE Main CSE': 625,
      'JEE Main ECE': 1600
    },
    fees: {
      tuition: 300000,
      hostel: 100000,
      other: 50000
    },
    facilities: ['Advanced labs', 'Library', 'Sports', 'Hostels', 'Research centers'],
    website: 'https://www.iiit.ac.in',
    contactInfo: {
      address: 'Gachibowli, Hyderabad, Telangana 500032',
      email: 'info@iiit.ac.in',
      phone: '+91-40-6653-1000'
    },
    placements: {
      averageCTC: 3000000,
      topCTC: 5000000,
      placementPercentage: 95,
      recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey']
    }
  },
  // Medical Colleges (NEET)
  {
    name: 'All India Institute of Medical Sciences Delhi',
    location: 'New Delhi, Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'government',
    accreditation: 'AIIMS',
    ranking: 1,
    courses: ['MBBS'],
    streams: ['Medical'],
    cutoffs: {
      'NEET MBBS': 50
    },
    fees: {
      tuition: 1300,
      hostel: 5000,
      other: 2000
    },
    facilities: ['Hospital', 'Library', 'Research labs', 'Hostels', 'Sports complex'],
    website: 'https://www.aiims.edu',
    contactInfo: {
      address: 'Ansari Nagar, New Delhi, Delhi 110029',
      email: 'info@aiims.edu',
      phone: '+91-11-2658-8500'
    },
    placements: {
      averageCTC: 0, // Medical students don't get placements, they do internships
      topCTC: 0,
      placementPercentage: 100,
      recruiters: ['Government Hospitals', 'Private Hospitals', 'Research Institutes']
    }
  },
  {
    name: 'All India Institute of Medical Sciences Jodhpur',
    location: 'Jodhpur, Rajasthan',
    city: 'Jodhpur',
    state: 'Rajasthan',
    type: 'government',
    accreditation: 'AIIMS',
    ranking: 2,
    courses: ['MBBS'],
    streams: ['Medical'],
    cutoffs: {
      'NEET MBBS': 575
    },
    fees: {
      tuition: 1300,
      hostel: 5000,
      other: 2000
    },
    facilities: ['Hospital', 'Library', 'Research labs', 'Hostels', 'Sports complex'],
    website: 'https://www.aiimsjodhpur.edu.in',
    contactInfo: {
      address: 'Basni Industrial Area, Jodhpur, Rajasthan 342005',
      email: 'info@aiimsjodhpur.edu.in',
      phone: '+91-291-274-0740'
    },
    placements: {
      averageCTC: 0,
      topCTC: 0,
      placementPercentage: 100,
      recruiters: ['Government Hospitals', 'Private Hospitals', 'Research Institutes']
    }
  }
];

// Add more colleges from the text file...
const addMoreColleges = () => {
  // IITs 7-23
  const moreIITs = [
    {
      name: 'Indian Institute of Technology Guwahati',
      location: 'Guwahati, Assam',
      city: 'Guwahati',
      state: 'Assam',
      type: 'government',
      accreditation: 'IIT',
      ranking: 7,
      courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech EE', 'B.Tech ME', 'B.Tech CE', 'B.Tech Chemical'],
      streams: ['Engineering'],
      cutoffs: {
        'JEE Advanced CSE': 850,
        'JEE Advanced ECE': 1750,
        'JEE Advanced EE': 3250,
        'JEE Advanced ME': 5250,
        'JEE Advanced CE': 10000,
        'JEE Advanced Chemical': 4750
      },
      fees: {
        tuition: 100000,
        hostel: 50000,
        other: 30000
      },
      facilities: ['Advanced labs', 'Library', 'Sports facilities', 'Hostels', 'Research centers'],
      website: 'https://www.iitg.ac.in',
      contactInfo: {
        address: 'Guwahati, Assam 781039',
        email: 'info@iitg.ac.in',
        phone: '+91-361-258-3000'
      },
      placements: {
        averageCTC: 1300000,
        topCTC: 2600000,
        placementPercentage: 85,
        recruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture']
      }
    }
    // Add more IITs, NITs, IIITs, and Medical colleges...
  ];
  
  return moreIITs;
};

const importColleges = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/careervista');
    console.log('Connected to MongoDB');

    // Clear existing colleges
    await College.deleteMany({});
    console.log('Cleared existing colleges');

    // Add comprehensive colleges
    const allColleges = [...comprehensiveColleges, ...addMoreColleges()];
    
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
importColleges();
