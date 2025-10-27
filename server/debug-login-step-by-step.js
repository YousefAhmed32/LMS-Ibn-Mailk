const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000';

async function debugLoginStepByStep() {
  try {
    console.log('🧪 Debug Login Step by Step...');
    
    // Step 1: Connect to the same database as the server
    const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/";
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Step 2: Find admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:', adminUser.email);
    console.log('   Role:', adminUser.role);
    console.log('   Has Password:', !!adminUser.password);
    
    // Step 3: Test password verification
    const password = 'admin123';
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    console.log('✅ Password verification:', isPasswordValid ? 'PASSED' : 'FAILED');
    
    // Step 4: Test the exact same logic as the login controller
    console.log('\n🔍 Testing login controller logic...');
    
    const userEmail = 'admin@example.com';
    const normalizedEmail = userEmail.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);
    
    // Test the exact regex query from the controller
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    if (!user) {
      console.log('❌ User not found with regex query');
      return;
    }
    
    console.log('✅ User found with regex query:', user.email);
    
    // Test password comparison
    const isPasswordValid2 = await bcrypt.compare(password, user.password);
    console.log('✅ Password comparison:', isPasswordValid2 ? 'PASSED' : 'FAILED');
    
    // Step 5: Test the actual API call
    console.log('\n🔍 Testing actual API call...');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: 'admin@example.com',
        password: 'admin123'
      });
      
      console.log('✅ API login successful:', response.data);
      
    } catch (error) {
      console.log('❌ API login failed:', error.response?.data || error.message);
      
      // Let's try to see what the server is actually receiving
      console.log('\n🔍 Testing with different email formats...');
      
      const testEmails = [
        'admin@example.com',
        'ADMIN@EXAMPLE.COM',
        ' admin@example.com ',
        'admin@example.com'
      ];
      
      for (const email of testEmails) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            userEmail: email,
            password: 'admin123'
          });
          
          console.log(`✅ Success with email: "${email}"`);
          console.log('Response:', response.data);
          break;
          
        } catch (error) {
          console.log(`❌ Failed with email: "${email}"`);
          console.log('Error:', error.response?.data || error.message);
        }
      }
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    mongoose.connection.close();
  }
}

debugLoginStepByStep();
