// Check admin user details and test password
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkAdminDetails() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/');
    console.log('✅ Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\n📊 Found ${adminUsers.length} admin users:`);
    
    for (let i = 0; i < adminUsers.length; i++) {
      const admin = adminUsers[i];
      console.log(`\n${i + 1}. Admin User:`);
      console.log(`   - ID: ${admin._id}`);
      console.log(`   - Email: ${admin.userEmail}`);
      console.log(`   - Role: ${admin.role}`);
      console.log(`   - First Name: ${admin.firstName}`);
      console.log(`   - Created: ${admin.createdAt}`);
      
      // Test password
      const testPasswords = ['admin123', 'password', '123456', 'admin'];
      for (const testPassword of testPasswords) {
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        if (isMatch) {
          console.log(`   - ✅ Password found: ${testPassword}`);
          break;
        }
      }
    }

    // Test login with the first admin
    if (adminUsers.length > 0) {
      const firstAdmin = adminUsers[0];
      console.log(`\n🔍 Testing login with first admin: ${firstAdmin.userEmail}`);
      
      const testPasswords = ['admin123', 'password', '123456', 'admin'];
      for (const testPassword of testPasswords) {
        const isMatch = await bcrypt.compare(testPassword, firstAdmin.password);
        if (isMatch) {
          console.log(`✅ Correct password: ${testPassword}`);
          console.log(`✅ Login should work with: userEmail="${firstAdmin.userEmail}", password="${testPassword}"`);
          break;
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAdminDetails();
