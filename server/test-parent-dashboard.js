const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const OTP = require('./models/OTP');
require('dotenv').config();

async function testParentDashboard() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ Connected to MongoDB');

    // Find test parent
    const parent = await User.findOne({ userEmail: 'parent@test.com' });
    if (!parent) {
      console.log('❌ Test parent not found. Please run create-test-students.js first');
      return;
    }
    console.log('✅ Found test parent:', parent.userEmail);

    // Find test student
    const student = await User.findOne({ studentId: 'STU12345678' });
    if (!student) {
      console.log('❌ Test student not found. Please run create-test-students.js first');
      return;
    }
    console.log('✅ Found test student:', student.studentId, student.userEmail);

    // Generate JWT token for parent
    const token = jwt.sign(
      { userId: parent._id, role: parent.role },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );
    console.log('✅ Generated JWT token for parent');

    // Test ParentDashboard endpoints
    console.log('\n🧪 Testing ParentDashboard endpoints...');
    
    const axios = require('axios');
    const baseURL = 'http://localhost:5000/api/parent';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      // Test 1: Get children
      console.log('\n1️⃣ Testing GET /:parentId/children...');
      const childrenResponse = await axios.get(`${baseURL}/${parent._id}/children`, { headers });
      console.log('✅ Get children successful:', childrenResponse.data);

      // Test 2: Get grades
      console.log('\n2️⃣ Testing GET /:parentId/grades/:childId...');
      const gradesResponse = await axios.get(`${baseURL}/${parent._id}/grades/${student._id}`, { headers });
      console.log('✅ Get grades successful:', gradesResponse.data);

      // Test 3: Get attendance
      console.log('\n3️⃣ Testing GET /:parentId/attendance/:childId...');
      const attendanceResponse = await axios.get(`${baseURL}/${parent._id}/attendance/${student._id}`, { headers });
      console.log('✅ Get attendance successful:', attendanceResponse.data);

      // Test 4: Get progress
      console.log('\n4️⃣ Testing GET /:parentId/progress/:childId...');
      const progressResponse = await axios.get(`${baseURL}/${parent._id}/progress/${student._id}`, { headers });
      console.log('✅ Get progress successful:', progressResponse.data);

      // Test 5: Export report
      console.log('\n5️⃣ Testing GET /:parentId/export-report/:childId...');
      const exportResponse = await axios.get(`${baseURL}/${parent._id}/export-report/${student._id}`, { 
        headers: { ...headers, 'Accept': 'application/pdf' },
        responseType: 'blob'
      });
      console.log('✅ Export report successful:', exportResponse.headers['content-type']);

      console.log('\n🎉 All ParentDashboard endpoints are working!');
      
    } catch (error) {
      console.log('❌ API test failed:', error.response?.data || error.message);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error testing ParentDashboard:', error);
    await mongoose.disconnect();
  }
}

// Run the test
testParentDashboard();
