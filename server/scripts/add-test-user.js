const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const addTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ userEmail: 'test@student.com' });
    if (existingUser) {
      console.log('Test user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create test user (password will be hashed by pre-save middleware)
    const testUser = new User({
      firstName: 'Test',
      secondName: 'Student',
      thirdName: 'User',
      fourthName: 'Name',
      userEmail: 'test@student.com',
      password: 'test123', // Plain text - will be hashed by middleware
      role: 'student',
      phoneStudent: '01234567890',
      governorate: 'Cairo',
      grade: 'grade10'
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Email: test@student.com');
    console.log('Password: test123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
addTestUser();
