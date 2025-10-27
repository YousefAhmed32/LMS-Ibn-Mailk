const mongoose = require('mongoose');

// Set mongoose options
mongoose.set('strictQuery', false);

// Connection function
const connectDB = async () => {
  try {
    const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn";
    
    const conn = await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
