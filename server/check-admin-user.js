const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdminUser() {
  try {
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Check all users
    const allUsers = await User.find({});
    console.log('📊 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   First Name: ${user.firstName}`);
      console.log(`   Has Password: ${!!user.password}`);
      console.log('   ---');
    });
    
    // Check specifically for admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   First Name:', adminUser.firstName);
      console.log('   Has Password:', !!adminUser.password);
    } else {
      console.log('❌ No admin user found');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

checkAdminUser();
