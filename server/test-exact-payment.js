// Test the exact payment ID from the error
const axios = require('axios');

async function testExactPayment() {
  try {
    console.log('🔍 Testing Exact Payment Approval...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      userEmail: 'admin@example.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed');
      return;
    }

    const authToken = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Test approval with exact payment ID from error
    const paymentId = '68bb787822627492a5e4dfc1';
    console.log(`\n2️⃣ Testing approval for payment ID: ${paymentId}`);
    
    const approvalResponse = await axios.patch(
      `http://localhost:5000/api/admin/payment-proofs/${paymentId}/approve`,
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
    }
  }
}

// Wait for server to start, then test
setTimeout(() => {
  testExactPayment();
}, 3000);
