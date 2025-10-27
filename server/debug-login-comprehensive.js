const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000';

async function debugLoginComprehensive() {
  try {
    console.log('🧪 Comprehensive Login Debug...');
    
    // Step 1: Check database connection
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Step 2: Check all admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\n📊 Found ${adminUsers.length} admin users in database:`);
    
    for (let i = 0; i < adminUsers.length; i++) {
      const user = adminUsers[i];
      console.log(`\n${i + 1}. Admin User:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Email: "${user.email}"`);
      console.log(`   First Name: ${user.firstName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Has Password: ${!!user.password}`);
      console.log(`   Password Length: ${user.password ? user.password.length : 0}`);
      
      if (user.password) {
        // Test password with 'admin123'
        const isPasswordValid = await bcrypt.compare('admin123', user.password);
        console.log(`   Password 'admin123' valid: ${isPasswordValid ? '✅' : '❌'}`);
      }
    }
    
    // Step 3: Test login with each admin user
    console.log('\n🔐 Testing login with each admin user...');
    
    for (const user of adminUsers) {
      console.log(`\n🔍 Testing login with: ${user.email}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          userEmail: user.email,
          password: 'admin123'
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', response.data);
        
        // If login successful, test course creation
        if (response.data.token) {
          console.log('\n🧪 Testing course creation...');
          
          const courseData = {
            title: 'Test Course from Debug Script',
            subject: 'mathematics',
            grade: '7',
            price: 100,
            duration: 10,
            level: 'beginner',
            description: 'Test course created from debug script'
          };
          
          const createResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
            headers: {
              'Authorization': `Bearer ${response.data.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Course creation successful!');
          console.log('Course response:', createResponse.data);
          
          return; // Exit on first success
        }
        
      } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
      }
    }
    
    // Step 4: Test with different passwords
    console.log('\n🔐 Testing with different passwords...');
    
    const testPasswords = ['admin123', 'admin', 'password', '123456', 'admin@test.com'];
    
    for (const password of testPasswords) {
      console.log(`\n🔍 Testing password: "${password}"`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          userEmail: 'admin@test.com',
          password: password
        });
        
        console.log('✅ Login successful with password:', password);
        console.log('Response:', response.data);
        return; // Exit on first success
        
      } catch (error) {
        console.log('❌ Failed with password:', password);
        console.log('Error:', error.response?.data || error.message);
      }
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    mongoose.connection.close();
  }
}

debugLoginComprehensive();
