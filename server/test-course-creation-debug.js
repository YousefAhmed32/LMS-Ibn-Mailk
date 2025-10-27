const axios = require('axios');
const mongoose = require('mongoose');

// Test configuration
const API_BASE_URL = 'http://localhost:5000';
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn";

// Test data that matches the frontend request
const testCourseData = {
  title: "ffff",
  subject: "لغة عربية",
  grade: "7",
  price: 499.98,
  duration: 0,
  description: "",
  level: "beginner",
  isActive: true,
  videos: [],
  exams: []
};

// Admin credentials for testing
const adminCredentials = {
  email: "admin@test.com",
  password: "admin123"
};

let adminToken = null;

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Ready State: ${mongoose.connection.readyState}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Login as admin to get token
async function loginAsAdmin() {
  try {
    console.log('\n🔐 Logging in as admin...');
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, adminCredentials);
    
    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      console.log('✅ Admin login successful');
      console.log(`   Token: ${adminToken.substring(0, 20)}...`);
      return true;
    } else {
      console.error('❌ Admin login failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Admin login error:', error.response?.data || error.message);
    return false;
  }
}

// Test course creation with detailed logging
async function testCourseCreation() {
  try {
    console.log('\n📝 Testing course creation...');
    console.log('Request data:', JSON.stringify(testCourseData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/api/admin/courses`, testCourseData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ Course creation successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ Course creation failed!');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    
    if (error.response?.data) {
      console.error('\n🔍 Detailed error analysis:');
      console.error('Success:', error.response.data.success);
      console.error('Message:', error.response.data.message);
      console.error('Error type:', error.response.data.errorType);
      console.error('Full error:', error.response.data.error);
      
      if (error.response.data.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
    }
    
    throw error;
  }
}

// Test MongoDB connection and Course model
async function testDatabaseAndModel() {
  try {
    console.log('\n🗄️ Testing database and Course model...');
    
    // Check MongoDB connection
    const readyState = mongoose.connection.readyState;
    console.log(`MongoDB ready state: ${readyState} (1=connected)`);
    
    if (readyState !== 1) {
      throw new Error('MongoDB not connected');
    }
    
    // Test Course model
    const Course = require('./models/Course');
    console.log('✅ Course model loaded successfully');
    
    // Test creating a course instance (without saving)
    const testCourse = new Course(testCourseData);
    console.log('✅ Course instance created successfully');
    
    // Test validation
    const validationError = testCourse.validateSync();
    if (validationError) {
      console.error('❌ Course validation failed:', validationError);
      const errors = Object.values(validationError.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Validation errors:', errors);
      throw validationError;
    } else {
      console.log('✅ Course validation passed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database/Model test failed:', error.message);
    throw error;
  }
}

// Test server health
async function testServerHealth() {
  try {
    console.log('\n🏥 Testing server health...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    
    if (response.data.status === 'OK') {
      console.log('✅ Server is healthy');
      console.log('Server info:', response.data);
      return true;
    } else {
      console.error('❌ Server health check failed:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Server health check error:', error.message);
    return false;
  }
}

// Main test function
async function runDiagnosticTest() {
  console.log('🔍 Starting Course Creation Diagnostic Test');
  console.log('==========================================');
  
  try {
    // 1. Connect to database
    await connectToDatabase();
    
    // 2. Test server health
    const serverHealthy = await testServerHealth();
    if (!serverHealthy) {
      throw new Error('Server is not healthy');
    }
    
    // 3. Test database and model
    await testDatabaseAndModel();
    
    // 4. Login as admin
    const loginSuccess = await loginAsAdmin();
    if (!loginSuccess) {
      throw new Error('Admin login failed');
    }
    
    // 5. Test course creation
    const result = await testCourseCreation();
    
    console.log('\n🎉 All tests passed! Course creation is working correctly.');
    console.log('Created course ID:', result.data?._id);
    
  } catch (error) {
    console.error('\n💥 Diagnostic test failed!');
    console.error('Error:', error.message);
    
    // Provide specific troubleshooting steps
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if MongoDB is running: mongod');
    console.log('2. Check if server is running: npm run dev');
    console.log('3. Verify admin user exists in database');
    console.log('4. Check server logs for detailed error information');
    console.log('5. Verify all middleware is properly configured');
    
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('\n📊 Test completed');
  }
}

// Run the test
if (require.main === module) {
  runDiagnosticTest();
}

module.exports = {
  testCourseCreation,
  testDatabaseAndModel,
  testServerHealth,
  runDiagnosticTest
};

