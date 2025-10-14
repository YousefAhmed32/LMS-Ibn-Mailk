// Create a proper admin user with correct field names
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createProperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/');
    console.log('✅ Connected to MongoDB');

    // Delete existing admin users with undefined emails
    await User.deleteMany({ userEmail: undefined });
    console.log('🗑️ Deleted admin users with undefined emails');

    // Create a proper admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      firstName: 'Admin',
      secondName: 'User',
      thirdName: 'System',
      fourthName: 'Manager',
      userEmail: 'admin@lms.com',
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
    console.log('- Email:', adminUser.userEmail);
    console.log('- Role:', adminUser.role);
    console.log('- ID:', adminUser._id);

    // Verify the admin user
    const verifyAdmin = await User.findOne({ role: 'admin' });
    console.log('\n🔍 Verification:');
    console.log('- Found admin:', verifyAdmin.userEmail);
    console.log('- Role:', verifyAdmin.role);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createProperAdmin();
