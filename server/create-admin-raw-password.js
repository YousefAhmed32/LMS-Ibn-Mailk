const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdminWithRawPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@test.com' });
    console.log('🗑️ Deleted existing admin user');

    // Create new admin user with raw password (will be hashed by pre-save middleware)
    const adminUser = new User({
      firstName: 'Admin',
      secondName: 'User',
      thirdName: 'System',
      fourthName: 'Manager',
      email: 'admin@test.com',
      password: 'admin123', // Raw password - will be hashed by pre-save middleware
      role: 'admin',
      phoneStudent: '01000000000',
      phoneFather: '01000000001',
      phoneMother: '01000000002',
      governorate: 'Cairo',
      grade: 'grade12'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully:');
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- ID:', adminUser._id);

    // Test the password using the instance method
    const testPassword = await adminUser.comparePassword('admin123');
    console.log(`\n🔐 Password test "admin123":`, testPassword ? '✅ Valid' : '❌ Invalid');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createAdminWithRawPassword();
