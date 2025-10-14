// Simple test to check server health
const axios = require('axios');

async function testServerHealth() {
  try {
    console.log('🔍 Testing server health...');
    
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Server health check failed:');
    console.error('Error message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Server is not running on port 5000');
    }
  }
}

testServerHealth();
