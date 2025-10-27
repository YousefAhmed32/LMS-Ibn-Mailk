const axios = require('axios');
const mongoose = require('mongoose');

// Test configuration
const API_BASE_URL = 'http://localhost:5000';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';

// Test data
const validUserData = {
  firstName: "أحمد",
  secondName: "محمد", 
  thirdName: "علي",
  fourthName: "حسن",
  userEmail: "test.user.1234567890@example.com",
  password: "password123",
  phoneStudent: "01234567890",
  phoneFather: "01234567891",
  phoneMother: "01234567892",
  governorate: "Cairo",
  grade: "grade10",
  role: "student"
};

const invalidUserData = {
  firstName: "", // Empty first name
  secondName: "محمد",
  userEmail: "invalid-email", // Invalid email format
  password: "123", // Too short password
  role: "student"
};

const duplicateUserData = {
  firstName: "سارة",
  secondName: "أحمد",
  thirdName: "محمد", 
  fourthName: "علي",
  userEmail: "test.user.1234567890@example.com", // Same email as validUserData
  password: "password456",
  phoneStudent: "01234567893",
  phoneFather: "01234567894",
  phoneMother: "01234567895",
  governorate: "Alexandria",
  grade: "grade11",
  role: "student"
};

const loginCredentials = {
  userEmail: "test.user.1234567890@example.com",
  password: "password123"
};

const invalidLoginCredentials = {
  userEmail: "test.user.1234567890@example.com",
  password: "wrongpassword"
};

let testResults = {
  registration: {
    valid: null,
    invalid: null,
    duplicate: null
  },
  login: {
    valid: null,
    invalid: null
  },
  issues: []
};

async function runAuthenticationTests() {
  console.log('🔐 Comprehensive Authentication System Test');
  console.log('==========================================');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Valid Registration
    console.log('\n📝 Test 1: Valid User Registration');
    console.log('====================================');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, validUserData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      testResults.registration.valid = {
        success: true,
        status: response.status,
        data: response.data
      };
      
      console.log('✅ Valid registration successful');
      console.log('   Status:', response.status);
      console.log('   Success:', response.data.success);
      console.log('   User ID:', response.data.user?._id);
      console.log('   Token:', response.data.token ? 'Present' : 'Missing');
      
    } catch (error) {
      testResults.registration.valid = {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
      
      console.log('❌ Valid registration failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
      testResults.issues.push('Valid registration failed');
    }
    
    // Test 2: Invalid Registration
    console.log('\n❌ Test 2: Invalid User Registration');
    console.log('====================================');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, invalidUserData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      testResults.registration.invalid = {
        success: false,
        status: response.status,
        data: response.data
      };
      
      console.log('⚠️ Invalid registration should have failed but succeeded');
      console.log('   Status:', response.status);
      testResults.issues.push('Invalid registration validation not working');
      
    } catch (error) {
      testResults.registration.invalid = {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
      
      console.log('✅ Invalid registration correctly rejected');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.response?.data?.message);
    }
    
    // Test 3: Duplicate Registration
    console.log('\n🔄 Test 3: Duplicate User Registration');
    console.log('=====================================');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, duplicateUserData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      testResults.registration.duplicate = {
        success: false,
        status: response.status,
        data: response.data
      };
      
      console.log('⚠️ Duplicate registration should have failed but succeeded');
      console.log('   Status:', response.status);
      testResults.issues.push('Duplicate email validation not working');
      
    } catch (error) {
      testResults.registration.duplicate = {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
      
      console.log('✅ Duplicate registration correctly rejected');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.response?.data?.message);
    }
    
    // Test 4: Valid Login
    console.log('\n🔐 Test 4: Valid User Login');
    console.log('===========================');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, loginCredentials, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      testResults.login.valid = {
        success: true,
        status: response.status,
        data: response.data
      };
      
      console.log('✅ Valid login successful');
      console.log('   Status:', response.status);
      console.log('   Success:', response.data.success);
      console.log('   Token:', response.data.token ? 'Present' : 'Missing');
      console.log('   User:', response.data.user?.email);
      
    } catch (error) {
      testResults.login.valid = {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
      
      console.log('❌ Valid login failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
      testResults.issues.push('Valid login failed');
    }
    
    // Test 5: Invalid Login
    console.log('\n❌ Test 5: Invalid User Login');
    console.log('==============================');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, invalidLoginCredentials, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      testResults.login.invalid = {
        success: false,
        status: response.status,
        data: response.data
      };
      
      console.log('⚠️ Invalid login should have failed but succeeded');
      console.log('   Status:', response.status);
      testResults.issues.push('Invalid login validation not working');
      
    } catch (error) {
      testResults.login.invalid = {
        success: false,
        status: error.response?.status,
        error: error.response?.data || error.message
      };
      
      console.log('✅ Invalid login correctly rejected');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error || error.response?.data?.message);
    }
    
    // Test 6: Database Verification
    console.log('\n🔍 Test 6: Database Verification');
    console.log('================================');
    const User = require('./models/User');
    const user = await User.findOne({ email: validUserData.userEmail });
    
    if (user) {
      console.log('✅ User found in database');
      console.log('   ID:', user._id);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Has password:', !!user.password);
      
      // Test password comparison
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(validUserData.password, user.password);
      console.log('   Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        testResults.issues.push('Password hashing/comparison issue');
      }
    } else {
      console.log('❌ User not found in database');
      testResults.issues.push('User not persisted to database');
    }
    
    // Generate Summary Report
    console.log('\n📊 AUTHENTICATION TEST SUMMARY');
    console.log('==============================');
    
    console.log('\n✅ SUCCESS CASES:');
    if (testResults.registration.valid?.success) {
      console.log('   - Valid user registration: WORKING');
    }
    if (testResults.login.valid?.success) {
      console.log('   - Valid user login: WORKING');
    }
    
    console.log('\n❌ FAILED CASES:');
    if (!testResults.registration.valid?.success) {
      console.log('   - Valid user registration: FAILED');
    }
    if (!testResults.login.valid?.success) {
      console.log('   - Valid user login: FAILED');
    }
    
    console.log('\n🔍 ISSUES IDENTIFIED:');
    if (testResults.issues.length === 0) {
      console.log('   - No issues found! Authentication system is working correctly.');
    } else {
      testResults.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    // Cleanup test user
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ email: validUserData.userEmail });
    console.log('✅ Test user deleted');
    
  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the authentication tests
runAuthenticationTests();
