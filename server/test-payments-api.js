/**
 * Test script to verify payments API endpoint
 */

const axios = require('axios');

async function testPaymentsAPI() {
  const BASE_URL = 'http://localhost:5000';
  
  console.log('🧪 Testing Payments API Endpoint...\n');
  
  try {
    // Test the payments endpoint without authentication (should return 401)
    console.log('📊 Testing GET /api/admin/payments (without auth)');
    
    const response = await axios.get(`${BASE_URL}/api/admin/payments`);
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ FAILED!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('\n✅ This is expected - authentication required');
      console.log('The endpoint is working correctly and requires authentication.');
    } else if (error.response?.status === 500) {
      console.log('\n❌ This indicates a server error.');
      console.log('Check the server logs for more details.');
    }
  }
}

// Run the test
if (require.main === module) {
  testPaymentsAPI().catch(console.error);
}

module.exports = { testPaymentsAPI };
