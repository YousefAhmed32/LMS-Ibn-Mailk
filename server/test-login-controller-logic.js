const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000';

async function testLoginControllerLogic() {
  try {
    console.log('🧪 Testing Login Controller Logic...');
    
    // Connect to Atlas database
    const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/";
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Test the exact same logic as the login controller
    const userEmail = 'admin@example.com';
    const password = 'admin123';
    
    console.log(`\n🔍 Testing login logic for: ${userEmail}`);
    
    // Step 1: Normalize email (same as controller)
    const email = userEmail; // Map userEmail to email for consistency
    console.log('Email after mapping:', email);
    
    // Step 2: Validate input (same as controller)
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return;
    }
    console.log('✅ Credentials present');
    
    // Step 3: Find user by email (same as controller)
    console.log('🔍 Searching for user with email:', email);
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);
    
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.email);
    
    // Step 4: Check password (same as controller)
    console.log('🔐 Comparing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return;
    }
    console.log('✅ Password valid');
    
    // Step 5: Generate token (same as controller)
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production", { expiresIn: '14d' });
    console.log('✅ Token generated');
    
    // Step 6: Test the actual API call
    console.log('\n🔍 Testing actual API call...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: userEmail,
        password: password
      });
      
      console.log('✅ API login successful:', response.data);
      
    } catch (error) {
      console.log('❌ API login failed:', error.response?.data || error.message);
      
      // Let's try to debug further
      console.log('\n🔍 Debugging API call...');
      
      // Test with different request formats
      const testCases = [
        { userEmail: 'admin@example.com', password: 'admin123' },
        { email: 'admin@example.com', password: 'admin123' },
        { userEmail: 'admin@example.com', password: 'admin123', role: 'admin' }
      ];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\nTest case ${i + 1}:`, Object.keys(testCase));
        
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/login`, testCase);
          console.log('✅ Success with test case', i + 1);
          console.log('Response:', response.data);
          break;
        } catch (error) {
          console.log('❌ Failed with test case', i + 1);
          console.log('Error:', error.response?.data || error.message);
        }
      }
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    mongoose.connection.close();
  }
}

testLoginControllerLogic();
