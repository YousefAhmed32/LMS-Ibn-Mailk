const axios = require('axios');

async function testCourseCreation() {
  try {
    // First, let's test if the server is running
    console.log('Testing server connection...');
    const healthCheck = await axios.get('http://localhost:5000/api/health');
    console.log('Server is running:', healthCheck.data);
  } catch (error) {
    console.log('Server health check failed:', error.message);
  }

  try {
    // Test course creation endpoint
    console.log('\nTesting course creation...');
    
    const courseData = {
      title: 'Test Course',
      description: 'Test Description',
      grade: '7',
      subject: 'رياضيات',
      price: 100,
      duration: 60,
      level: 'beginner'
    };

    const response = await axios.post('http://localhost:5000/api/admin/courses', courseData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth, but we'll see the error
      }
    });

    console.log('Course creation successful:', response.data);
  } catch (error) {
    console.log('Course creation failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('Full error:', error.message);
  }
}

testCourseCreation();
