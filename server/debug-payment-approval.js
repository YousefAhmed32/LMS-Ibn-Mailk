// Debug script to test payment approval with detailed logging
const axios = require('axios');

async function debugPaymentApproval() {
  console.log('🔍 Debugging Payment Approval...\n');
  
  // Test with a real payment ID (you'll need to replace this with an actual ID from your database)
  const testPaymentId = '507f1f77bcf86cd799439011'; // Replace with actual payment ID
  
  try {
    console.log('=== Testing Payment Approval ===');
    console.log('Payment ID:', testPaymentId);
    console.log('Endpoint:', `PATCH http://localhost:5000/api/admin/payment-proofs/${testPaymentId}/approve`);
    
    // Test 1: Check if the new PATCH endpoint exists
    console.log('\n1. Testing PATCH endpoint...');
    try {
      const response = await axios.patch(`http://localhost:5000/api/admin/payment-proofs/${testPaymentId}/approve`);
      console.log('✅ PATCH endpoint exists and responded');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('📊 PATCH endpoint responded with status:', error.response.status);
        console.log('Response:', error.response.data);
        
        if (error.response.status === 401) {
          console.log('✅ Authentication required (expected)');
        } else if (error.response.status === 404) {
          console.log('✅ Payment not found (expected for test ID)');
        } else if (error.response.status === 400) {
          console.log('✅ Bad request (validation working)');
        } else {
          console.log('⚠️  Unexpected status:', error.response.status);
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server not running');
        return;
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
    // Test 2: Check if the old POST endpoint still exists (it shouldn't)
    console.log('\n2. Testing old POST endpoint...');
    try {
      const response = await axios.post('http://localhost:5000/api/admin/payment-proofs/approve', {
        paymentId: testPaymentId
      });
      console.log('⚠️  Old POST endpoint still exists (this might be the issue)');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('📊 Old POST endpoint status:', error.response.status);
        if (error.response.status === 404) {
          console.log('✅ Old POST endpoint removed (good)');
        } else {
          console.log('Response:', error.response.data);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
    // Test 3: Test with invalid ID format
    console.log('\n3. Testing with invalid ID format...');
    try {
      const response = await axios.patch('http://localhost:5000/api/admin/payment-proofs/invalid-id/approve');
      console.log('❌ Should have failed with invalid ID');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly returns 400 for invalid ID');
        console.log('Response:', error.response.data);
      } else {
        console.log('⚠️  Unexpected response for invalid ID:', error.response?.status);
      }
    }
    
    console.log('\n🎯 Debug Summary:');
    console.log('- Check if server is running and routes are updated');
    console.log('- Verify the PATCH endpoint is working');
    console.log('- Confirm old POST endpoint is removed');
    console.log('- Test with actual payment ID from database');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugPaymentApproval().catch(console.error);
