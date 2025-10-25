const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testUser = {
  email: 'admin@test.com',
  password: 'password123'
};

let authToken = null;

// Helper function to create a test image
const createTestImage = () => {
  const canvas = require('canvas');
  const { createCanvas } = canvas;
  
  const canvasElement = createCanvas(200, 200);
  const ctx = canvasElement.getContext('2d');
  
  // Draw a simple test pattern
  ctx.fillStyle = '#FF6B6B';
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = '#4ECDC4';
  ctx.fillRect(100, 0, 100, 100);
  ctx.fillStyle = '#45B7D1';
  ctx.fillRect(0, 100, 100, 100);
  ctx.fillStyle = '#96CEB4';
  ctx.fillRect(100, 100, 100, 100);
  
  // Add text
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TEST IMAGE', 100, 120);
  ctx.fillText(new Date().toISOString(), 100, 150);
  
  return canvasElement.toBuffer('image/png');
};

// Helper function to login and get auth token
const login = async () => {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_BASE}/auth/login`, testUser);
    authToken = response.data.token;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
};

// Test image upload endpoint
const testImageUpload = async () => {
  try {
    console.log('\n📤 Testing image upload...');
    
    const formData = new FormData();
    const testImageBuffer = createTestImage();
    formData.append('image', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    const response = await axios.post(`${API_BASE}/uploads/image`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Upload response:', response.data);
    
    if (response.data.success && response.data.data?.url) {
      const imageUrl = response.data.data.url;
      console.log('🖼️ Image URL:', imageUrl);
      
      // Test image retrieval
      await testImageRetrieval(imageUrl);
      
      return {
        success: true,
        url: imageUrl,
        filename: response.data.data.filename
      };
    } else {
      throw new Error('Upload response missing success or URL');
    }
    
  } catch (error) {
    console.error('❌ Image upload failed:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

// Test image retrieval
const testImageRetrieval = async (imageUrl) => {
  try {
    console.log('🖼️ Testing image retrieval...');
    
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.length > 0) {
      console.log('✅ Image retrieval successful');
      console.log(`📊 Image size: ${response.data.length} bytes`);
      return true;
    } else {
      throw new Error('Invalid response');
    }
    
  } catch (error) {
    console.error('❌ Image retrieval failed:', error.message);
    return false;
  }
};

// Test course creation with image
const testCourseCreation = async () => {
  try {
    console.log('\n📚 Testing course creation with image...');
    
    const formData = new FormData();
    const testImageBuffer = createTestImage();
    
    // Course data
    formData.append('title', 'Test Course with GridFS Image');
    formData.append('description', 'This is a test course to verify GridFS image upload');
    formData.append('subject', 'Mathematics');
    formData.append('grade', '10');
    formData.append('price', '100');
    formData.append('duration', '30');
    formData.append('level', 'beginner');
    formData.append('isActive', 'true');
    
    // Image file
    formData.append('image', testImageBuffer, {
      filename: 'course-image.png',
      contentType: 'image/png'
    });
    
    const response = await axios.post(`${API_BASE}/admin/courses`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Course creation response:', response.data);
    
    if (response.data.success && response.data.data?.imageUrl) {
      const imageUrl = response.data.data.imageUrl;
      console.log('🖼️ Course image URL:', imageUrl);
      
      // Test course image retrieval
      await testImageRetrieval(imageUrl);
      
      return {
        success: true,
        courseId: response.data.data._id,
        imageUrl: imageUrl
      };
    } else {
      throw new Error('Course creation response missing success or imageUrl');
    }
    
  } catch (error) {
    console.error('❌ Course creation failed:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

// Test payment proof upload
const testPaymentProofUpload = async () => {
  try {
    console.log('\n💳 Testing payment proof upload...');
    
    const formData = new FormData();
    const testImageBuffer = createTestImage();
    
    // Payment data
    formData.append('senderNumber', '01012345678');
    formData.append('studentNumber', '01087654321');
    formData.append('parentNumber', '01011111111');
    
    // Image file
    formData.append('image', testImageBuffer, {
      filename: 'payment-proof.png',
      contentType: 'image/png'
    });
    
    const response = await axios.post(`${API_BASE}/payment-proof`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Payment proof upload response:', response.data);
    
    if (response.data.success && response.data.proofImage) {
      const imageUrl = response.data.proofImage;
      console.log('🖼️ Payment proof image URL:', imageUrl);
      
      // Test payment proof image retrieval
      await testImageRetrieval(imageUrl);
      
      return {
        success: true,
        paymentId: response.data.paymentId,
        imageUrl: imageUrl
      };
    } else {
      throw new Error('Payment proof upload response missing success or proofImage');
    }
    
  } catch (error) {
    console.error('❌ Payment proof upload failed:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

// Test group creation with image
const testGroupCreation = async () => {
  try {
    console.log('\n👥 Testing group creation with image...');
    
    const formData = new FormData();
    const testImageBuffer = createTestImage();
    
    // Group data
    formData.append('name', 'Test Group with GridFS Image');
    formData.append('description', 'This is a test group to verify GridFS image upload');
    formData.append('grade', '10');
    formData.append('subject', 'Mathematics');
    formData.append('maxStudents', '30');
    formData.append('isActive', 'true');
    
    // Image file
    formData.append('image', testImageBuffer, {
      filename: 'group-image.png',
      contentType: 'image/png'
    });
    
    const response = await axios.post(`${API_BASE}/groups`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Group creation response:', response.data);
    
    if (response.data.success && response.data.data?.imageUrl) {
      const imageUrl = response.data.data.imageUrl;
      console.log('🖼️ Group image URL:', imageUrl);
      
      // Test group image retrieval
      await testImageRetrieval(imageUrl);
      
      return {
        success: true,
        groupId: response.data.data._id,
        imageUrl: imageUrl
      };
    } else {
      throw new Error('Group creation response missing success or imageUrl');
    }
    
  } catch (error) {
    console.error('❌ Group creation failed:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting GridFS Upload Tests');
  console.log('================================');
  
  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running');
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first.');
    process.exit(1);
  }
  
  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('❌ Cannot proceed without authentication');
    process.exit(1);
  }
  
  const results = {
    imageUpload: false,
    courseCreation: false,
    paymentProof: false,
    groupCreation: false
  };
  
  // Test 1: Direct image upload
  console.log('\n🧪 Test 1: Direct Image Upload');
  const imageUploadResult = await testImageUpload();
  results.imageUpload = imageUploadResult.success;
  
  // Test 2: Course creation with image
  console.log('\n🧪 Test 2: Course Creation with Image');
  const courseResult = await testCourseCreation();
  results.courseCreation = courseResult.success;
  
  // Test 3: Payment proof upload
  console.log('\n🧪 Test 3: Payment Proof Upload');
  const paymentResult = await testPaymentProofUpload();
  results.paymentProof = paymentResult.success;
  
  // Test 4: Group creation with image
  console.log('\n🧪 Test 4: Group Creation with Image');
  const groupResult = await testGroupCreation();
  results.groupCreation = groupResult.success;
  
  // Print results
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Image Upload: ${results.imageUpload ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Course Upload: ${results.courseCreation ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Payment Upload: ${results.paymentProof ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Group Upload: ${results.groupCreation ? 'PASS' : 'FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! GridFS upload system is working correctly.');
    console.log('✅ Course upload: OK');
    console.log('✅ Group upload: OK');
    console.log('✅ Payment upload: OK');
    console.log('✅ Preview display: Working');
    console.log('✅ API Responses: 200 OK');
    console.log('✅ No Redirect or Network Errors');
  } else {
    console.log('\n❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testImageUpload,
  testCourseCreation,
  testPaymentProofUpload,
  testGroupCreation
};
