const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testLoginBypassValidation() {
  try {
    console.log('🧪 Testing Login with different approaches...');
    
    // Test 1: Try with different email formats
    const testEmails = [
      'admin@test.com',
      'ADMIN@TEST.COM',
      ' admin@test.com ',
      'admin@test.com',
      'admin@example.com',
      'ADMIN@EXAMPLE.COM'
    ];
    
    for (const email of testEmails) {
      console.log(`\n🔍 Testing email: "${email}"`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          userEmail: email,
          password: 'admin123'
        });
        
        console.log('✅ Success with email:', email);
        console.log('Response:', response.data);
        return; // Exit on first success
      } catch (error) {
        console.log('❌ Failed with email:', email);
        console.log('Error:', error.response?.data || error.message);
      }
    }
    
    // Test 2: Try with different password formats
    console.log('\n🔍 Testing different passwords...');
    const testPasswords = ['admin123', 'admin', 'password', '123456'];
    
    for (const password of testPasswords) {
      console.log(`\n🔍 Testing password: "${password}"`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          userEmail: 'admin@test.com',
          password: password
        });
        
        console.log('✅ Success with password:', password);
        console.log('Response:', response.data);
        return; // Exit on first success
      } catch (error) {
        console.log('❌ Failed with password:', password);
        console.log('Error:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginBypassValidation();
