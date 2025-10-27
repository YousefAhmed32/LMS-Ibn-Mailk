const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkAtlasAdminPasswords() {
  try {
    console.log('🧪 Checking Atlas Admin Passwords...');
    
    // Connect to Atlas database
    const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/";
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Get all admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\n👑 Found ${adminUsers.length} admin users in Atlas database:`);
    
    for (let i = 0; i < adminUsers.length; i++) {
      const user = adminUsers[i];
      console.log(`\n${i + 1}. Admin User:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   First Name: ${user.firstName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has Password: ${!!user.password}`);
      console.log(`   Password Length: ${user.password ? user.password.length : 0}`);
      
      if (user.password) {
        // Test with different passwords
        const testPasswords = [
          'admin123',
          'admin',
          'password',
          '123456',
          'admin@example.com',
          'admin@test.com',
          'admin2@gmail.com',
          'Admin123',
          'ADMIN123',
          'admin@example.com',
          'admin@test.com',
          'admin2@gmail.com'
        ];
        
        console.log('   Testing passwords:');
        for (const pwd of testPasswords) {
          const isValid = await bcrypt.compare(pwd, user.password);
          if (isValid) {
            console.log(`     ✅ Password "${pwd}" is VALID!`);
          } else {
            console.log(`     ❌ Password "${pwd}" is invalid`);
          }
        }
      }
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

checkAtlasAdminPasswords();
