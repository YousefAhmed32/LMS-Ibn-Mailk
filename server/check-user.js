const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ userEmail: 'admin@test.com' });
    
    if (user) {
      console.log('👤 User found:');
      console.log('   ID:', user._id);
      console.log('   Email:', user.userEmail);
      console.log('   Role:', user.role);
      console.log('   Password hash:', user.password.substring(0, 20) + '...');
      console.log('   Created:', user.createdAt);
    } else {
      console.log('❌ User not found');
      
      // List all users
      const allUsers = await User.find({}, 'userEmail role');
      console.log('📋 All users in database:');
      allUsers.forEach(u => console.log(`   - ${u.userEmail} (${u.role})`));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkUser();
