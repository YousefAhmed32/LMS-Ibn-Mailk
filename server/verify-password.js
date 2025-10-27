const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function verifyPassword() {
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
    
    console.log('✅ Admin user found:');
    console.log('   Email:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   First Name:', adminUser.firstName);
    console.log('   Has Password:', !!adminUser.password);
    console.log('   Password Length:', adminUser.password ? adminUser.password.length : 0);
    
    // Test password verification
    const testPassword = 'admin123';
    console.log(`\n🔐 Testing password: "${testPassword}"`);
    
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log('Password valid:', isPasswordValid);
    
    // Test with different passwords
    const testPasswords = ['admin123', 'admin', 'password', '123456'];
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, adminUser.password);
      console.log(`Password "${pwd}": ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    }
    
    // Hash a new password and test
    console.log('\n🔐 Testing with newly hashed password...');
    const newHashedPassword = await bcrypt.hash('admin123', 10);
    const isNewPasswordValid = await bcrypt.compare('admin123', newHashedPassword);
    console.log('New password valid:', isNewPasswordValid);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

verifyPassword();
