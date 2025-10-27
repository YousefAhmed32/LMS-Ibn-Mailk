const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testAllAdminUsers() {
  try {
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`📊 Found ${adminUsers.length} admin users:`);
    
    for (let i = 0; i < adminUsers.length; i++) {
      const user = adminUsers[i];
      console.log(`\n${i + 1}. Admin User:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   First Name: ${user.firstName}`);
      console.log(`   Has Password: ${!!user.password}`);
      console.log(`   Password Length: ${user.password ? user.password.length : 0}`);
      
      // Test password with 'admin123'
      if (user.password) {
        const isPasswordValid = await bcrypt.compare('admin123', user.password);
        console.log(`   Password 'admin123' valid: ${isPasswordValid ? '✅' : '❌'}`);
        
        // Test with other common passwords
        const testPasswords = ['admin', 'password', '123456', 'admin@example.com'];
        for (const pwd of testPasswords) {
          const isValid = await bcrypt.compare(pwd, user.password);
          if (isValid) {
            console.log(`   ✅ Password '${pwd}' is valid!`);
          }
        }
      }
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

testAllAdminUsers();
