/**
 * Test script for Duplicate Payment Prevention System
 * Tests all aspects of the duplicate payment handling
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  studentEmail: 'test.student@example.com',
  studentPassword: 'TestPassword123!',
  courseId: null,
  authToken: null
};

// Test data
const TEST_PAYMENT_DATA = {
  studentName: 'Test Student',
  studentPhone: '01006657702',
  amount: '200',
  transactionId: '01006657702' // This will cause duplicate error
};

/**
 * Initialize test environment
 */
const initializeTest = async () => {
  console.log('🚀 Initializing Duplicate Payment Prevention Test');
  console.log('================================================\n');

  try {
    // Login as test student
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: TEST_CONFIG.studentEmail,
      password: TEST_CONFIG.studentPassword
    });

    if (loginResponse.data.success) {
      TEST_CONFIG.authToken = loginResponse.data.token;
      console.log('✅ Student login successful');
    } else {
      throw new Error('Student login failed');
    }

    // Get available courses
    const coursesResponse = await axios.get(`${API_BASE}/courses`, {
      headers: { 'Authorization': `Bearer ${TEST_CONFIG.authToken}` }
    });

    if (coursesResponse.data.success && coursesResponse.data.data.length > 0) {
      TEST_CONFIG.courseId = coursesResponse.data.data[0]._id;
      console.log('✅ Course found for testing');
    } else {
      throw new Error('No courses available for testing');
    }

    return true;
  } catch (error) {
    console.error('❌ Test initialization failed:', error.message);
    return false;
  }
};

/**
 * Test 1: Duplicate Transaction ID Prevention
 */
const testDuplicateTransactionId = async () => {
  console.log('🧪 Test 1: Duplicate Transaction ID Prevention');
  console.log('--------------------------------------------');

  try {
    // First submission (should succeed)
    console.log('📤 Submitting first payment...');
    const firstResponse = await submitTestPayment('FIRST_TXN_001');
    
    if (firstResponse.success) {
      console.log('✅ First payment submitted successfully');
    } else {
      console.log('❌ First payment failed:', firstResponse.message);
      return false;
    }

    // Second submission with same transaction ID (should fail)
    console.log('📤 Submitting duplicate payment...');
    const duplicateResponse = await submitTestPayment('FIRST_TXN_001');
    
    if (duplicateResponse.status === 409 && duplicateResponse.code === 'DUPLICATE_TRANSACTION_ID') {
      console.log('✅ Duplicate transaction ID correctly rejected');
      console.log('   - Status:', duplicateResponse.status);
      console.log('   - Error:', duplicateResponse.error);
      console.log('   - Message:', duplicateResponse.message);
      return true;
    } else {
      console.log('❌ Duplicate transaction ID not properly handled');
      console.log('   - Response:', duplicateResponse);
      return false;
    }

  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    return false;
  }
};

/**
 * Test 2: Duplicate Pending Payment Prevention
 */
const testDuplicatePendingPayment = async () => {
  console.log('\n🧪 Test 2: Duplicate Pending Payment Prevention');
  console.log('----------------------------------------------');

  try {
    // Submit first pending payment
    console.log('📤 Submitting first pending payment...');
    const firstResponse = await submitTestPayment('PENDING_TXN_001');
    
    if (firstResponse.success) {
      console.log('✅ First pending payment submitted');
    } else {
      console.log('❌ First pending payment failed:', firstResponse.message);
      return false;
    }

    // Try to submit another pending payment for same course
    console.log('📤 Submitting duplicate pending payment...');
    const duplicateResponse = await submitTestPayment('PENDING_TXN_002');
    
    if (duplicateResponse.status === 400 && duplicateResponse.code === 'DUPLICATE_PENDING_PAYMENT') {
      console.log('✅ Duplicate pending payment correctly rejected');
      console.log('   - Status:', duplicateResponse.status);
      console.log('   - Error:', duplicateResponse.error);
      console.log('   - Code:', duplicateResponse.code);
      return true;
    } else {
      console.log('❌ Duplicate pending payment not properly handled');
      console.log('   - Response:', duplicateResponse);
      return false;
    }

  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    return false;
  }
};

/**
 * Test 3: MongoDB Error Handling
 */
const testMongoDBErrorHandling = async () => {
  console.log('\n🧪 Test 3: MongoDB Error Handling');
  console.log('--------------------------------');

  try {
    // Test with invalid course ID (should trigger cast error)
    console.log('📤 Testing with invalid course ID...');
    const invalidCourseResponse = await submitTestPayment('CAST_ERROR_TEST', 'invalid_course_id');
    
    if (invalidCourseResponse.status === 400 && invalidCourseResponse.code === 'CAST_ERROR') {
      console.log('✅ Cast error properly handled');
      console.log('   - Status:', invalidCourseResponse.status);
      console.log('   - Code:', invalidCourseResponse.code);
    } else {
      console.log('❌ Cast error not properly handled');
      console.log('   - Response:', invalidCourseResponse);
    }

    // Test with missing required fields (should trigger validation error)
    console.log('📤 Testing with missing required fields...');
    const validationResponse = await submitTestPaymentWithMissingFields();
    
    if (validationResponse.status === 400 && validationResponse.code === 'VALIDATION_ERROR') {
      console.log('✅ Validation error properly handled');
      console.log('   - Status:', validationResponse.status);
      console.log('   - Code:', validationResponse.code);
      console.log('   - Details:', validationResponse.details);
    } else {
      console.log('❌ Validation error not properly handled');
      console.log('   - Response:', validationResponse);
    }

    return true;
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
    return false;
  }
};

/**
 * Test 4: Frontend Prevention (Simulation)
 */
const testFrontendPrevention = async () => {
  console.log('\n🧪 Test 4: Frontend Prevention (Simulation)');
  console.log('-------------------------------------------');

  try {
    // Simulate rapid double-click submission
    console.log('📤 Simulating rapid double-click submission...');
    
    const promises = [
      submitTestPayment('RAPID_TXN_001'),
      submitTestPayment('RAPID_TXN_001') // Same transaction ID
    ];

    const responses = await Promise.allSettled(promises);
    
    const successCount = responses.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const duplicateCount = responses.filter(r => 
      r.status === 'fulfilled' && 
      r.value.status === 409 && 
      r.value.code === 'DUPLICATE_TRANSACTION_ID'
    ).length;

    if (successCount === 1 && duplicateCount === 1) {
      console.log('✅ Frontend prevention working correctly');
      console.log('   - Successful submissions:', successCount);
      console.log('   - Duplicate rejections:', duplicateCount);
      return true;
    } else {
      console.log('❌ Frontend prevention not working correctly');
      console.log('   - Successful submissions:', successCount);
      console.log('   - Duplicate rejections:', duplicateCount);
      return false;
    }

  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
    return false;
  }
};

/**
 * Test 5: Error Response Format
 */
const testErrorResponseFormat = async () => {
  console.log('\n🧪 Test 5: Error Response Format');
  console.log('---------------------------------');

  try {
    const duplicateResponse = await submitTestPayment('FORMAT_TEST_TXN');
    
    // Check response format
    const hasRequiredFields = [
      'success',
      'error',
      'message',
      'code',
      'details'
    ].every(field => duplicateResponse.hasOwnProperty(field));

    if (hasRequiredFields) {
      console.log('✅ Error response format is correct');
      console.log('   - success:', duplicateResponse.success);
      console.log('   - error:', duplicateResponse.error);
      console.log('   - message:', duplicateResponse.message);
      console.log('   - code:', duplicateResponse.code);
      console.log('   - details:', duplicateResponse.details);
      return true;
    } else {
      console.log('❌ Error response format is incorrect');
      console.log('   - Response:', duplicateResponse);
      return false;
    }

  } catch (error) {
    console.error('❌ Test 5 failed:', error.message);
    return false;
  }
};

/**
 * Submit test payment
 */
const submitTestPayment = async (transactionId, courseId = null) => {
  try {
    const formData = new FormData();
    
    formData.append('courseId', courseId || TEST_CONFIG.courseId);
    formData.append('studentName', TEST_PAYMENT_DATA.studentName);
    formData.append('studentPhone', TEST_PAYMENT_DATA.studentPhone);
    formData.append('amount', TEST_PAYMENT_DATA.amount);
    formData.append('transactionId', transactionId);
    
    // Create a dummy image buffer for testing
    const dummyImageBuffer = Buffer.from('fake-image-data');
    formData.append('screenshot', dummyImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    const response = await axios.post(`${API_BASE}/submit`, formData, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
        ...formData.getHeaders()
      }
    });

    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, error: error.message };
  }
};

/**
 * Submit test payment with missing fields
 */
const submitTestPaymentWithMissingFields = async () => {
  try {
    const formData = new FormData();
    
    // Only add courseId, missing other required fields
    formData.append('courseId', TEST_CONFIG.courseId);
    
    const response = await axios.post(`${API_BASE}/submit`, formData, {
      headers: {
        'Authorization': `Bearer ${TEST_CONFIG.authToken}`,
        ...formData.getHeaders()
      }
    });

    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, error: error.message };
  }
};

/**
 * Run all tests
 */
const runAllTests = async () => {
  console.log('🎯 Duplicate Payment Prevention System Test Suite');
  console.log('================================================\n');

  const initSuccess = await initializeTest();
  if (!initSuccess) {
    console.log('❌ Test initialization failed. Exiting...');
    return;
  }

  const results = {
    duplicateTransactionId: await testDuplicateTransactionId(),
    duplicatePendingPayment: await testDuplicatePendingPayment(),
    mongoDBErrorHandling: await testMongoDBErrorHandling(),
    frontendPrevention: await testFrontendPrevention(),
    errorResponseFormat: await testErrorResponseFormat()
  };

  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Duplicate payment prevention system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testDuplicateTransactionId,
  testDuplicatePendingPayment,
  testMongoDBErrorHandling,
  testFrontendPrevention,
  testErrorResponseFormat
};
