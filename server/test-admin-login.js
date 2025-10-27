const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testAdminLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- Has password:', !!adminUser.password);

    // Test password
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    
    console.log(`\n🔐 Testing password "${testPassword}":`, isPasswordValid ? '✅ Valid' : '❌ Invalid');

    if (!isPasswordValid) {
      console.log('🔧 Updating password...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      adminUser.password = hashedPassword;
      await adminUser.save();
      console.log('✅ Password updated successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testAdminLogin();
