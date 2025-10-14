const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    // Connect to the remote MongoDB cluster (same as server)
    const MONGO_URL = "mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/";
    
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to remote MongoDB cluster');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ userEmail: 'admin@example.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email:', existingAdmin.userEmail);
      console.log('Role:', existingAdmin.role);
      mongoose.connection.close();
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user with all required fields
    const adminUser = new User({
      firstName: 'Admin',
      secondName: 'User',
      thirdName: 'Admin',
      fourthName: 'User',
      userEmail: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      grade: 'grade12',
      governorate: 'Cairo',
      phoneStudent: '+201234567890',
      phoneFather: '+201234567891'
    });
    
    await adminUser.save();
    console.log('✅ Admin user created successfully in remote MongoDB!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    mongoose.connection.close();
  }
}

createAdminUser();
