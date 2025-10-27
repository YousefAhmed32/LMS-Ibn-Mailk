const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createNewAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@test.com' });
    console.log('🗑️ Deleted existing admin user');

    // Create new admin user with proper password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const adminUser = new User({
      firstName: 'Admin',
      secondName: 'User',
      thirdName: 'System',
      fourthName: 'Manager',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      phoneStudent: '01000000000',
      phoneFather: '01000000001',
      phoneMother: '01000000002',
      governorate: 'Cairo',
      grade: 'grade12'
    });

    await adminUser.save();
    console.log('✅ New admin user created successfully:');
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- ID:', adminUser._id);

    // Test the password immediately
    const testPassword = await bcrypt.compare(password, adminUser.password);
    console.log(`\n🔐 Password test "${password}":`, testPassword ? '✅ Valid' : '❌ Invalid');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createNewAdmin();
