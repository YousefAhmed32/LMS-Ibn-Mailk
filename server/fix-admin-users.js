const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function fixAdminUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ Connected to MongoDB');

    // Find all admin users with undefined emails
    const adminUsers = await User.find({ role: 'admin', userEmail: undefined });
    console.log(`\n📊 Found ${adminUsers.length} admin users with undefined emails`);

    if (adminUsers.length > 0) {
      // Delete all admin users with undefined emails
      await User.deleteMany({ role: 'admin', userEmail: undefined });
      console.log('🗑️ Deleted admin users with undefined emails');
    }

    // Create a proper admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
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
    console.log('✅ Proper admin user created successfully:');
    console.log('- Email:', adminUser.email);
    console.log('- Role:', adminUser.role);
    console.log('- ID:', adminUser._id);

    // Verify the admin user
    const verifyAdmin = await User.findOne({ role: 'admin', email: 'admin@test.com' });
    console.log('\n🔍 Verification:');
    console.log('- Found admin:', verifyAdmin.email);
    console.log('- Role:', verifyAdmin.role);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixAdminUsers();
