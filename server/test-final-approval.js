// Final test for payment approval
const axios = require('axios');

async function testFinalApproval() {
  try {
    console.log('🔍 Final Payment Approval Test...\n');

    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      userEmail: 'admin@example.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed:', loginResponse.data);
      return;
    }

    const authToken = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Get pending payments
    console.log('\n2️⃣ Fetching pending payments...');
    const pendingResponse = await axios.get('http://localhost:5000/api/admin/payment-proofs/pending', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (!pendingResponse.data.data || pendingResponse.data.data.length === 0) {
      console.log('❌ No pending payments found');
      return;
    }

    const testPayment = pendingResponse.data.data[0];
    console.log('✅ Found test payment:', testPayment._id);
    console.log('Payment status:', testPayment.status);

    // Step 3: Test approval
    console.log('\n3️⃣ Testing payment approval...');
    const approvalResponse = await axios.patch(
      `http://localhost:5000/api/admin/payment-proofs/${testPayment._id}/approve`,
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

testFinalApproval();
