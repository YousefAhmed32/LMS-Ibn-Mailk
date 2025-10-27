const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testDatabaseConnection() {
  try {
    console.log('🧪 Testing Database Connection...');
    
    // Check environment variables
    console.log('Environment variables:');
    console.log('  MONGO_URL:', process.env.MONGO_URL || 'Not set');
    console.log('  NODE_ENV:', process.env.NODE_ENV || 'Not set');
    
    // Connect to the same database as the server
    const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn";
    console.log(`\n🔌 Connecting to: ${MONGO_URL}`);
    
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Check database name
    console.log(`📊 Database name: ${mongoose.connection.name}`);
    console.log(`📊 Database host: ${mongoose.connection.host}`);
    console.log(`📊 Database port: ${mongoose.connection.port}`);
    
    // Check all users in this database
    const allUsers = await User.find({});
    console.log(`\n👥 Found ${allUsers.length} users in database:`);
    
    for (let i = 0; i < Math.min(allUsers.length, 10); i++) {
      const user = allUsers[i];
      console.log(`  ${i + 1}. ${user.email} (${user.role})`);
    }
    
    if (allUsers.length > 10) {
      console.log(`  ... and ${allUsers.length - 10} more users`);
    }
    
    // Check specifically for admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\n👑 Found ${adminUsers.length} admin users:`);
    
    for (let i = 0; i < adminUsers.length; i++) {
      const user = adminUsers[i];
      console.log(`  ${i + 1}. ${user.email} (${user.firstName} ${user.secondName})`);
    }
    
    // Check for the specific admin users we created
    const specificAdmins = [
      'admin@example.com',
      'admin@test.com',
      'admin2@gmail.com'
    ];
    
    console.log('\n🔍 Checking for specific admin users:');
    for (const email of specificAdmins) {
      const user = await User.findOne({ email });
      if (user) {
        console.log(`  ✅ Found: ${email} (${user.role})`);
      } else {
        console.log(`  ❌ Not found: ${email}`);
      }
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

testDatabaseConnection();
