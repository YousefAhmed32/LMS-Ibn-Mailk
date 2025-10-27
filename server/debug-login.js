const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugLogin() {
  try {
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    const email = 'admin@example.com';
    const password = 'admin123';
    
    console.log('🔍 Searching for user with email:', email);
    
    // Find user by email (case-insensitive and trimmed)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return;
    }

    console.log('✅ User found:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });

    // Check password
    console.log('🔐 Comparing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    console.log('Password valid:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Login should succeed!');
    } else {
      console.log('❌ Login should fail - password mismatch');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

debugLogin();
