const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createAdminUser() {
  try {
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create admin user with all required fields
      const adminUser = new User({
        firstName: 'Admin',
        secondName: 'User',
        thirdName: 'Admin',
        fourthName: 'User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        grade: 'grade12',
        governorate: 'Cairo',
        phoneStudent: '+201234567890',
        phoneFather: '+201234567891'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Role: admin');
    }
    
    // Check if test student user already exists
    const existingStudent = await User.findOne({ email: 'student@example.com' });
    if (existingStudent) {
      console.log('✅ Test student user already exists');
      console.log('Email:', existingStudent.email);
      console.log('Role:', existingStudent.role);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('student123', 10);
      
      // Create test student user
      const studentUser = new User({
        firstName: 'Test',
        secondName: 'Student',
        thirdName: 'User',
        fourthName: 'Student',
        email: 'student@example.com',
        password: hashedPassword,
        role: 'student',
        grade: 'grade10',
        governorate: 'Cairo',
        phoneStudent: '+201234567892',
        phoneFather: '+201234567893'
      });
      
      await studentUser.save();
      console.log('✅ Test student user created successfully!');
      console.log('Email: student@example.com');
      console.log('Password: student123');
      console.log('Role: student');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating users:', error);
    mongoose.connection.close();
  }
}

createAdminUser();
