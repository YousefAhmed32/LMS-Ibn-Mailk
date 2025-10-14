const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const debugAuth = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ Connected to MongoDB');

    // Find the test user
    const user = await User.findOne({ userEmail: 'admin@test.com' });
    
    if (user) {
      console.log('👤 User found:');
      console.log('   Email:', user.userEmail);
      console.log('   Password (first 20 chars):', user.password.substring(0, 20) + '...');
      console.log('   Password length:', user.password.length);
      console.log('   Role:', user.role);
      
      // Test password comparison
      const isPasswordValid = await bcrypt.compare('test123', user.password);
      console.log('🔐 Password comparison result:', isPasswordValid);
      
      // Test with wrong password
      const isWrongPasswordValid = await bcrypt.compare('wrongpassword', user.password);
      console.log('❌ Wrong password test:', isWrongPasswordValid);
      
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the debug
debugAuth();
