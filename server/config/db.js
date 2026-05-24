const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let dbMode = 'mongodb';
const JSON_DB_DIR = path.join(__dirname, '../data');

const connectDB = async () => {
  // Ensure JSON database directory exists
  if (!fs.existsSync(JSON_DB_DIR)) {
    fs.mkdirSync(JSON_DB_DIR, { recursive: true });
  }

  // Set standard mongoose option
  mongoose.set('strictQuery', false);

  try {
    console.log('Connecting to MongoDB...');
    // Attempt standard connection with 3-second timeout to avoid long blocks
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    dbMode = 'mongodb';
    console.log('✨ Connected successfully to MongoDB. Running in Native Mongoose Mode.');
  } catch (error) {
    dbMode = 'json';
    console.log('⚠️  MongoDB Connection Failed:', error.message);
    console.log('🚀 Running in Local JSON Database Failover Mode. Ready to run out-of-the-box.');
  }
};

const getDbMode = () => dbMode;

module.exports = { connectDB, getDbMode };
