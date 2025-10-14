const axios = require('axios');
const FormData = require('form-data');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test data
const testUser = {
  userEmail: 'student@example.com',
  password: 'student123'
};

let authToken = '';

// Helper function
const makeRequest = async (method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${url}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error ${method} ${url}:`, error.response?.data || error.message);
    throw error;
  }
};

// Test functions
const testLogin = async () => {
  console.log('🔐 Testing student login...');
  
  try {
    const response = await makeRequest('POST', '/auth/login', testUser);
    authToken = response.token;
    console.log('✅ Student login successful');
    return true;
  } catch (error) {
    console.log('❌ Student login failed');
    return false;
  }
};

const testPaymentRedirect = async () => {
  console.log('💳 Testing payment submission with redirect...');
  
  try {
    // Get a real course ID
    console.log('   - Fetching courses to get a valid course ID...');
    const coursesResponse = await makeRequest('GET', '/courses');
    if (!coursesResponse.success || !coursesResponse.data || coursesResponse.data.length === 0) {
      console.log('   - No courses found');
      return false;
    }
    
    // Try to find a course without pending payment
    let courseId = null;
    for (const course of coursesResponse.data) {
      // Check if user already has pending payment for this course
      try {
        const paymentsResponse = await makeRequest('GET', '/my-payments');
        const hasPendingPayment = paymentsResponse.data?.some(payment => 
          payment.courseId._id === course._id && payment.status === 'pending'
        );
        if (!hasPendingPayment) {
          courseId = course._id;
          break;
        }
      } catch (error) {
        // If we can't check payments, just use the first course
        courseId = course._id;
        break;
      }
    }
    
    if (!courseId) {
      console.log('   - All courses have pending payments, using first course anyway');
      courseId = coursesResponse.data[0]._id;
    }
    
    console.log('   - Using course ID:', courseId);
    
    // Create a simple test image buffer
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('studentName', 'Test Student');
    formData.append('studentPhone', '01012345678');
    // Find the course we're using to get the correct price
    const selectedCourse = coursesResponse.data.find(course => course._id === courseId);
    formData.append('amount', selectedCourse.price || '200');
    formData.append('transactionId', `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    formData.append('screenshot', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    const response = await axios.post(`${API_BASE}/submit`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Payment submission successful');
    console.log('   - Response success:', response.data.success);
    console.log('   - Redirect URL:', response.data.redirectUrl);
    console.log('   - Message:', response.data.message);
    
    // Verify redirectUrl is present and correct
    if (response.data.redirectUrl === "/") {
      console.log('✅ Redirect URL is correct: "/"');
      return true;
    } else {
      console.log('❌ Redirect URL is incorrect:', response.data.redirectUrl);
      return false;
    }
  } catch (error) {
    console.log('❌ Payment submission failed');
    console.log('   - Status:', error.response?.status);
    console.log('   - Error details:', error.response?.data);
    return false;
  }
};

// Run test
const runTest = async () => {
  console.log('🚀 Testing Payment Redirect Functionality\n');
  
  try {
    await testLogin();
    await testPaymentRedirect();
    console.log('\n🎉 Test completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

runTest();
