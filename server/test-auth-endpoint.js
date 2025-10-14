const axios = require('axios');

async function testAuthEndpoint() {
  try {
    console.log('🧪 Testing auth endpoint...');
    
    // Test the login endpoint
    const loginData = {
      userEmail: 'admin@example.com',
      password: 'admin123'
    };
    
    console.log('📤 Sending login request...');
    console.log('Data:', loginData);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
    if (response.data.token) {
      console.log('🎫 Token received:', response.data.token.substring(0, 20) + '...');
      
      // Now test course creation with the token
      console.log('\n📚 Testing course creation...');
      
      const courseData = {
        title: 'Test Course - Mathematics',
        description: 'This is a test course for mathematics',
        subject: 'mathematics',
        grade: '7',
        price: 100,
        duration: 60,
        level: 'beginner'
      };
      
      const courseResponse = await axios.post('http://localhost:5000/api/admin/courses', courseData, {
        headers: {
          'Authorization': `Bearer ${response.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Course creation successful!');
      console.log('Status:', courseResponse.status);
      console.log('Response:', courseResponse.data);
      
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
  }
}

testAuthEndpoint();
