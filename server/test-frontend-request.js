const axios = require('axios');

async function testFrontendRequest() {
  try {
    console.log('Testing frontend request simulation...');
    
    // Step 1: Check if server is running
    console.log('Step 1: Checking server health...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running:', healthResponse.data);
    
    // Step 2: Login as admin (simulate frontend login)
    console.log('Step 2: Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      userEmail: 'admin@lms.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    
    // Step 3: Simulate the exact frontend request
    console.log('Step 3: Simulating frontend course creation request...');
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add the same fields that the frontend sends
    formData.append('title', 'Test Frontend Course');
    formData.append('description', 'Test Description from Frontend');
    formData.append('subject', 'رياضيات');
    formData.append('grade', '7');
    formData.append('price', '100');
    formData.append('duration', '60');
    formData.append('level', 'beginner');
    formData.append('isActive', 'true');
    formData.append('videos', JSON.stringify([
      {
        title: 'Test Video',
        url: 'https://www.youtube.com/watch?v=test',
        order: 0,
        duration: 10,
        thumbnail: 'https://img.youtube.com/vi/test/maxresdefault.jpg'
      }
    ]));
    
    const createResponse = await axios.post('http://localhost:5000/api/admin/courses', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Course creation successful:', createResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testFrontendRequest();
