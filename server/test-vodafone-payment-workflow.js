const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = '';
let adminToken = '';
let courseId = '';
let paymentId = '';

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null, token = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (data) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testStudentLogin = async () => {
  console.log('\n🔐 Testing student login...');
  
  const response = await makeRequest('POST', '/auth/login', {
    userEmail: TEST_EMAIL,
    password: TEST_PASSWORD
  });

  if (response.success) {
    authToken = response.token;
    console.log('✅ Student login successful');
    return true;
  } else {
    console.log('❌ Student login failed');
    return false;
  }
};

const testAdminLogin = async () => {
  console.log('\n🔐 Testing admin login...');
  
  const response = await makeRequest('POST', '/auth/login', {
    userEmail: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });

  if (response.success) {
    adminToken = response.token;
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.log('❌ Admin login failed');
    return false;
  }
};

const testGetCourses = async () => {
  console.log('\n📚 Testing get courses...');
  
  const response = await makeRequest('GET', '/courses', null, authToken);

  if (response.success && response.data.length > 0) {
    courseId = response.data[0]._id;
    console.log(`✅ Found ${response.data.length} courses. Using course: ${response.data[0].title}`);
    return true;
  } else {
    console.log('❌ No courses found');
    return false;
  }
};

const testSubmitPayment = async () => {
  console.log('\n💳 Testing payment submission...');
  
  // Create a dummy image file for testing
  const dummyImagePath = path.join(__dirname, 'test-screenshot.png');
  if (!fs.existsSync(dummyImagePath)) {
    // Create a simple 1x1 pixel PNG
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(dummyImagePath, pngBuffer);
  }

  const formData = new FormData();
  formData.append('courseId', courseId);
  formData.append('studentName', 'أحمد محمد علي');
  formData.append('studentPhone', '01012345678');
  formData.append('amount', '100');
  formData.append('transactionId', 'TXN123456789');
  formData.append('screenshot', fs.createReadStream(dummyImagePath));

  try {
    const response = await axios.post(`${BASE_URL}/submit`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    if (response.data.success) {
      paymentId = response.data.data._id;
      console.log('✅ Payment submitted successfully');
      console.log(`   Payment ID: ${paymentId}`);
      return true;
    } else {
      console.log('❌ Payment submission failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Payment submission error:', error.response?.data || error.message);
    return false;
  }
};

const testGetAllPayments = async () => {
  console.log('\n📋 Testing get all payments (admin)...');
  
  const response = await makeRequest('GET', '/admin/all', null, adminToken);

  if (response.success) {
    console.log(`✅ Found ${response.data.length} payments`);
    return true;
  } else {
    console.log('❌ Failed to get payments');
    return false;
  }
};

const testAcceptPayment = async () => {
  console.log('\n✅ Testing payment acceptance...');
  
  const response = await makeRequest('PATCH', `/admin/${paymentId}/accept`, null, adminToken);

  if (response.success) {
    console.log('✅ Payment accepted successfully');
    return true;
  } else {
    console.log('❌ Payment acceptance failed');
    return false;
  }
};

const testGetPaymentStats = async () => {
  console.log('\n📊 Testing payment statistics...');
  
  const response = await makeRequest('GET', '/admin/stats', null, adminToken);

  if (response.success) {
    console.log('✅ Payment stats retrieved:');
    console.log(`   Total Payments: ${response.data.totalPayments}`);
    console.log(`   Total Amount: ${response.data.totalAmount} EGP`);
    console.log(`   Accepted Amount: ${response.data.acceptedAmount} EGP`);
    console.log(`   Pending Amount: ${response.data.pendingAmount} EGP`);
    console.log(`   Rejected Amount: ${response.data.rejectedAmount} EGP`);
    return true;
  } else {
    console.log('❌ Failed to get payment stats');
    return false;
  }
};

const testStudentPayments = async () => {
  console.log('\n👤 Testing student payments...');
  
  const response = await makeRequest('GET', '/my-payments', null, authToken);

  if (response.success) {
    console.log(`✅ Found ${response.data.length} student payments`);
    return true;
  } else {
    console.log('❌ Failed to get student payments');
    return false;
  }
};

const testCourseAccess = async () => {
  console.log('\n🎓 Testing course access after payment acceptance...');
  
  const response = await makeRequest('GET', `/courses/${courseId}/access`, null, authToken);

  if (response.success && response.data.hasAccess) {
    console.log('✅ Student has access to the course');
    return true;
  } else {
    console.log('❌ Student does not have access to the course');
    return false;
  }
};

// Main test function
const runPaymentWorkflowTest = async () => {
  console.log('🚀 Starting Vodafone Cash Payment Workflow Test\n');
  console.log('=' * 60);

  try {
    // Test student login
    if (!(await testStudentLogin())) {
      console.log('\n❌ Test failed at student login');
      return;
    }

    // Test admin login
    if (!(await testAdminLogin())) {
      console.log('\n❌ Test failed at admin login');
      return;
    }

    // Test get courses
    if (!(await testGetCourses())) {
      console.log('\n❌ Test failed at get courses');
      return;
    }

    // Test submit payment
    if (!(await testSubmitPayment())) {
      console.log('\n❌ Test failed at payment submission');
      return;
    }

    // Test get all payments (admin)
    if (!(await testGetAllPayments())) {
      console.log('\n❌ Test failed at get all payments');
      return;
    }

    // Test accept payment
    if (!(await testAcceptPayment())) {
      console.log('\n❌ Test failed at payment acceptance');
      return;
    }

    // Test get payment stats
    if (!(await testGetPaymentStats())) {
      console.log('\n❌ Test failed at payment stats');
      return;
    }

    // Test student payments
    if (!(await testStudentPayments())) {
      console.log('\n❌ Test failed at student payments');
      return;
    }

    // Test course access
    if (!(await testCourseAccess())) {
      console.log('\n❌ Test failed at course access');
      return;
    }

    console.log('\n' + '=' * 60);
    console.log('🎉 All tests passed! Vodafone Cash payment workflow is working correctly.');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Student login');
    console.log('   ✅ Admin login');
    console.log('   ✅ Course retrieval');
    console.log('   ✅ Payment submission');
    console.log('   ✅ Payment management (admin)');
    console.log('   ✅ Payment acceptance');
    console.log('   ✅ Payment statistics');
    console.log('   ✅ Student payment history');
    console.log('   ✅ Course access after payment');

  } catch (error) {
    console.log('\n❌ Test failed with error:', error.message);
  }
};

// Run the test
if (require.main === module) {
  runPaymentWorkflowTest();
}

module.exports = {
  runPaymentWorkflowTest,
  testStudentLogin,
  testAdminLogin,
  testGetCourses,
  testSubmitPayment,
  testGetAllPayments,
  testAcceptPayment,
  testGetPaymentStats,
  testStudentPayments,
  testCourseAccess
};
