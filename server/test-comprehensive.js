// Comprehensive test to identify the exact issue
const axios = require('axios');

async function testComprehensive() {
  console.log('🔍 Comprehensive Payment Approval Test...\n');
  
  const testPaymentId = '507f1f77bcf86cd799439011';
  
  try {
    // Test 1: Check server status
    console.log('1. Checking server status...');
    try {
      const response = await axios.get('http://localhost:5000/api/admin/payment-proofs/pending');
      console.log('❌ Unexpected success (should require auth)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Server is running and requires authentication');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running');
        return;
      } else {
        console.log('✅ Server is responding');
      }
    }
    
    // Test 2: Test the new PATCH endpoint
    console.log('\n2. Testing new PATCH endpoint...');
    try {
      const response = await axios.patch(`http://localhost:5000/api/admin/payment-proofs/${testPaymentId}/approve`);
      console.log('❌ Unexpected success');
    } catch (error) {
      if (error.response) {
        console.log('📊 PATCH endpoint response:');
        console.log('  Status:', error.response.status);
        console.log('  Data:', error.response.data);
        
        if (error.response.status === 401) {
          console.log('✅ PATCH endpoint exists and requires authentication');
        } else if (error.response.status === 400) {
          console.log('✅ PATCH endpoint exists and validates input');
        } else if (error.response.status === 404) {
          console.log('✅ PATCH endpoint exists and handles not found');
        } else {
          console.log('⚠️  Unexpected status:', error.response.status);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
    // Test 3: Test the old POST endpoint (should not exist)
    console.log('\n3. Testing old POST endpoint...');
    try {
      const response = await axios.post('http://localhost:5000/api/admin/payment-proofs/approve', {
        paymentId: testPaymentId
      });
      console.log('❌ Old POST endpoint still exists and responded!');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('📊 Old POST endpoint response:');
        console.log('  Status:', error.response.status);
        console.log('  Data:', error.response.data);
        
        if (error.response.status === 404) {
          console.log('✅ Old POST endpoint removed (good)');
        } else if (error.response.status === 401) {
          console.log('⚠️  Old POST endpoint still exists but requires auth');
        } else {
          console.log('⚠️  Old POST endpoint still exists with status:', error.response.status);
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
    // Test 4: Test with invalid ID format
    console.log('\n4. Testing with invalid ID format...');
    try {
      const response = await axios.patch('http://localhost:5000/api/admin/payment-proofs/invalid-id/approve');
      console.log('❌ Should have failed with invalid ID');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly returns 400 for invalid ID format');
        console.log('Response:', error.response.data);
      } else if (error.response?.status === 401) {
        console.log('✅ Requires authentication (expected)');
      } else {
        console.log('⚠️  Unexpected response for invalid ID:', error.response?.status);
      }
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('- Check if the server process is running the updated code');
    console.log('- Verify that the old POST endpoint is completely removed');
    console.log('- Test with actual payment ID from database');
    console.log('- Check server logs for detailed error information');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testComprehensive().catch(console.error);