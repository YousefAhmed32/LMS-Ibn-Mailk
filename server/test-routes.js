// Simple test to verify routes are working
const axios = require('axios');

async function testRoutes() {
  console.log('🧪 Testing Routes...\n');
  
  try {
    // Test 1: Check if PATCH endpoint exists
    console.log('1. Testing PATCH endpoint...');
    try {
      await axios.patch('http://localhost:5000/api/admin/payment-proofs/test-id/approve');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ PATCH endpoint exists - returns 400 for invalid ID (expected)');
      } else if (error.response?.status === 401) {
        console.log('✅ PATCH endpoint exists - requires authentication (expected)');
      } else {
        console.log('⚠️  PATCH endpoint status:', error.response?.status);
      }
    }
    
    // Test 2: Check if old POST endpoint still exists
    console.log('\n2. Testing old POST endpoint...');
    try {
      await axios.post('http://localhost:5000/api/admin/payment-proofs/approve', {
        paymentId: 'test-id'
      });
      console.log('❌ Old POST endpoint still exists!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Old POST endpoint removed (good)');
      } else if (error.response?.status === 401) {
        console.log('⚠️  Old POST endpoint still exists but requires auth');
      } else {
        console.log('Status:', error.response?.status);
      }
    }
    
    console.log('\n🎯 Route Test Complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRoutes().catch(console.error);
