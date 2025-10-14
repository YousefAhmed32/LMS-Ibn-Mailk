// Comprehensive test to debug payment approval 500 error
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data - using existing admin from database
const testAdminCredentials = {
  email: 'admin@example.com', // This will be updated based on actual admin email
  password: 'admin123'
};

let authToken = '';
let testPaymentId = '';

async function testPaymentApproval() {
  try {
    console.log('🔍 Starting Payment Approval Debug Test...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testAdminCredentials);
    
    if (loginResponse.data.success) {
      authToken = loginResponse.data.token;
      console.log('✅ Admin login successful');
      console.log('Admin ID:', loginResponse.data.user._id);
    } else {
      throw new Error('Admin login failed');
    }

    // Step 2: Get pending payment proofs
    console.log('\n2️⃣ Fetching pending payment proofs...');
    const pendingResponse = await axios.get(`${BASE_URL}/admin/payment-proofs/pending`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('Pending payments count:', pendingResponse.data.data?.length || 0);
    
    if (pendingResponse.data.data && pendingResponse.data.data.length > 0) {
      testPaymentId = pendingResponse.data.data[0]._id;
      console.log('✅ Found test payment ID:', testPaymentId);
      console.log('Payment details:', JSON.stringify(pendingResponse.data.data[0], null, 2));
    } else {
      console.log('⚠️ No pending payments found. Creating a test payment...');
      await createTestPayment();
    }

    // Step 3: Test payment approval
    if (testPaymentId) {
      console.log('\n3️⃣ Testing payment approval...');
      console.log('Payment ID to approve:', testPaymentId);
      
      const approvalResponse = await axios.patch(
        `${BASE_URL}/admin/payment-proofs/${testPaymentId}/approve`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Payment approval successful!');
      console.log('Response:', JSON.stringify(approvalResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', error.response.headers);
    }
    
    if (error.request) {
      console.error('Request config:', error.config);
    }
  }
}

async function createTestPayment() {
  try {
    console.log('Creating test payment...');
    
    // First, get a course ID
    const coursesResponse = await axios.get(`${BASE_URL}/courses`);
    if (coursesResponse.data.success && coursesResponse.data.data.length > 0) {
      const courseId = coursesResponse.data.data[0]._id;
      console.log('Using course ID:', courseId);
      
      // Create a test payment proof
      const testPaymentData = new FormData();
      testPaymentData.append('studentPhone', '01012345678');
      testPaymentData.append('senderPhone', '01087654321');
      testPaymentData.append('parentPhone', '01011111111');
      testPaymentData.append('paymentImage', 'test-image-data');
      
      const paymentResponse = await axios.post(
        `${BASE_URL}/payment-proof`,
        testPaymentData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (paymentResponse.data.success) {
        testPaymentId = paymentResponse.data.payment._id;
        console.log('✅ Test payment created:', testPaymentId);
      }
    }
  } catch (error) {
    console.error('Failed to create test payment:', error.message);
  }
}

// Run the test
testPaymentApproval();
