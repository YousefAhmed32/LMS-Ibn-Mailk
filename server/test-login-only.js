// Test login endpoint only
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing Login Endpoint...\n');

    // Test login with different admin credentials
    const adminCredentials = [
      { userEmail: 'youns-admin@gmail.com', password: 'admin123' },
      { userEmail: 'admin@lms.com', password: 'admin123' },
      { userEmail: 'admin@example.com', password: 'admin123' }
    ];

    for (const creds of adminCredentials) {
      try {
        console.log(`Trying login with: ${creds.userEmail}`);
        const response = await axios.post('http://localhost:5000/api/auth/login', creds);
        
        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.data.user.role === 'admin') {
          console.log('🎉 Found admin user!');
          return response.data.token;
        }
      } catch (error) {
        console.log(`❌ Login failed with: ${creds.userEmail}`);
        if (error.response) {
          console.log('Error response:', error.response.data);
        }
      }
    }

    console.log('❌ No valid admin credentials found');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Wait for server to start, then test
setTimeout(() => {
  testLogin();
}, 3000);
