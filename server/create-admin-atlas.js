const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminAtlas() {
  try {
    console.log('🧪 Creating Admin User in Atlas Database...');
    
    // Use the same database as the server
    const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/";
    console.log(`🔌 Connecting to: ${MONGO_URL}`);
    
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      
      // Test password
      const isPasswordValid = await bcrypt.compare('admin123', existingAdmin.password);
      console.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('🔐 Updating password...');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        existingAdmin.password = hashedPassword;
        await existingAdmin.save();
        console.log('✅ Password updated');
      }
    } else {
      console.log('❌ Admin user not found, creating new one...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      // Create admin user
      const adminUser = new User({
        firstName: 'Admin',
        secondName: 'User',
        thirdName: 'Admin',
        fourthName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        phoneFather: '+201234567890',
        phoneMother: '+201234567891'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully!');
    }
    
    // Test password verification
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);
    console.log('✅ Password verification test:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

createAdminAtlas();
