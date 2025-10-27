const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function debugAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ Connected to MongoDB');

    // Find admin user by email
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found with email: admin@test.com');
      
      // Check all users
      const allUsers = await User.find({});
      console.log(`\n📊 All users in database (${allUsers.length}):`);
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user._id}, Email: ${user.email}, Role: ${user.role}`);
      });
      return;
    }

    console.log('✅ Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- Password hash:', adminUser.password.substring(0, 20) + '...');

    // Test password manually
    const testPassword = 'admin123';
    console.log(`\n🔐 Testing password "${testPassword}":`);
    
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password);
    console.log('Password valid:', isPasswordValid);

    // Test the exact login logic from the controller
    console.log('\n🔍 Testing login logic:');
    const normalizedEmail = adminUser.email.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);
    
    const userFound = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    console.log('User found by regex:', !!userFound);
    console.log('User ID match:', userFound?._id.toString() === adminUser._id.toString());

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugAdminUser();
