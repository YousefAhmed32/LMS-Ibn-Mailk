const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testLoginDirect() {
  try {
    console.log('🧪 Testing Login Direct...');
    
    // Test with different field names
    const testCases = [
      { userEmail: 'admin@example.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'admin123' },
      { userEmail: 'admin@example.com', password: 'admin123', role: 'admin' }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n${i + 1}. Testing with:`, Object.keys(testCase));
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, testCase);
        console.log('✅ Success:', response.data);
        return; // Exit on first success
      } catch (error) {
        console.log('❌ Failed:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginDirect();
