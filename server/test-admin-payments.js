const axios = require('axios');

const testAdminPayments = async () => {
  try {
    console.log('🧪 Testing Admin Payments API...\n');
    
    // First, login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      userEmail: 'admin@test.com',
      password: 'test123'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Admin login failed:', loginResponse.data.error);
      return;
    }
    
    console.log('✅ Admin login successful');
    const adminToken = loginResponse.data.token;
    
    // Test admin payments API
    console.log('\n2. Testing admin payments API...');
    const paymentsResponse = await axios.get('http://localhost:5000/api/admin/payments?limit=10', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Admin payments API successful!');
    console.log('Response status:', paymentsResponse.status);
    console.log('Response data:', JSON.stringify(paymentsResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('Server error details:', error.response.data);
    }
  }
};

testAdminPayments();
