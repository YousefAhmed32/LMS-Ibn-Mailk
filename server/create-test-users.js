// Create test users for login testing
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/');
    console.log('✅ Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $in: ['admin@test.com', 'student@test.com', 'parent@test.com'] } });
    console.log('🗑️ Cleared existing test users');

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      secondName: 'Test',
      thirdName: 'User',
      fourthName: 'System',
      email: 'admin@test.com', // Fixed: use 'email' not 'userEmail'
      password: 'admin123', // Will be hashed by pre-save middleware
      role: 'admin',
      phoneStudent: '01000000000',
      phoneFather: '01000000001',
      phoneMother: '01000000002',
      governorate: 'Cairo',
      grade: 'تالتة ثانوي'
    });

    await adminUser.save();
    console.log('✅ Admin user created:', adminUser.email);

    // Create student user
    const studentUser = new User({
      firstName: 'Student',
      secondName: 'Test',
      thirdName: 'User',
      fourthName: 'Demo',
      email: 'student@test.com', // Fixed: use 'email' not 'userEmail'
      password: 'student123', // Will be hashed by pre-save middleware
      role: 'student',
      phoneStudent: '01111111111',
      phoneFather: '01111111112',
      phoneMother: '01111111113',
      governorate: 'Giza',
      grade: 'أولى ثانوي'
    });

    await studentUser.save();
    console.log('✅ Student user created:', studentUser.email);

    // Create parent user
    const parentUser = new User({
      firstName: 'Parent',
      secondName: 'Test',
      thirdName: 'User',
      fourthName: 'Demo',
      email: 'parent@test.com', // Fixed: use 'email' not 'userEmail'
      password: 'parent123', // Will be hashed by pre-save middleware
      role: 'parent',
      phoneNumber: '01222222222',
      phoneFather: '01222222223',
      phoneMother: '01222222224',
      relation: 'Father'
    });

    await parentUser.save();
    console.log('✅ Parent user created:', parentUser.email);

    // Verify users were created with hashed passwords
    const users = await User.find({ email: { $in: ['admin@test.com', 'student@test.com', 'parent@test.com'] } });
    console.log('\n🔍 Verification:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}): Password hashed = ${user.password.startsWith('$2')}, Length = ${user.password.length}`);
    });

    console.log('\n✅ Test users created successfully!');
    console.log('You can now test login with:');
    console.log('- admin@test.com / admin123');
    console.log('- student@test.com / student123');
    console.log('- parent@test.com / parent123');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createTestUsers();
