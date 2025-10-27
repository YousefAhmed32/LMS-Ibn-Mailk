const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdminPassword() {
  try {
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    
    // Hash the password correctly
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 New hashed password created');
    
    // Update the password
    adminUser.password = hashedPassword;
    await adminUser.save();
    
    console.log('✅ Admin password updated successfully');
    
    // Verify the password works
    const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
    console.log('✅ Password verification test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

fixAdminPassword();
