// Simple test for payment approval using existing data
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSimpleApproval() {
  try {
    console.log('🔍 Testing Payment Approval with Existing Data...\n');

    // Step 1: Try to login with common admin credentials
    const adminCredentials = [
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'admin@lms.com', password: 'admin123' },
      { email: 'admin', password: 'admin123' }
    ];

    let authToken = '';
    let adminEmail = '';

    for (const creds of adminCredentials) {
      try {
        console.log(`Trying login with: ${creds.email}`);
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, creds);
        
        if (loginResponse.data.success && loginResponse.data.user.role === 'admin') {
          authToken = loginResponse.data.token;
          adminEmail = creds.email;
          console.log(`✅ Admin login successful with: ${creds.email}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Login failed with: ${creds.email}`);
      }
    }

    if (!authToken) {
      console.log('❌ Could not login as admin. Please check admin credentials.');
      return;
    }

    // Step 2: Get pending payments
    console.log('\n📋 Fetching pending payments...');
    const pendingResponse = await axios.get(`${BASE_URL}/admin/payment-proofs/pending`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('Pending payments:', pendingResponse.data.data?.length || 0);
    
    if (!pendingResponse.data.data || pendingResponse.data.data.length === 0) {
      console.log('❌ No pending payments found');
      return;
    }

    const testPayment = pendingResponse.data.data[0];
    console.log('Test payment details:');
    console.log('- ID:', testPayment._id);
    console.log('- Student Phone:', testPayment.studentPhone);
    console.log('- Status:', testPayment.status);
    console.log('- Course:', testPayment.courseId?.title || 'Standalone');

    // Step 3: Test approval
    console.log('\n🚀 Testing payment approval...');
    console.log('URL:', `${BASE_URL}/admin/payment-proofs/${testPayment._id}/approve`);
    
    const approvalResponse = await axios.patch(
      `${BASE_URL}/admin/payment-proofs/${testPayment._id}/approve`,
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

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error message:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      
      // Check if it's hitting the old endpoint
      if (error.response.status === 410) {
        console.error('🚨 This is hitting the deprecated POST endpoint!');
      }
    }
  }
}

testSimpleApproval();
