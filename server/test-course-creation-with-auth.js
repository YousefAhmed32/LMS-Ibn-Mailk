const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testCourseCreationWithAuth() {
  try {
    console.log('🧪 Testing Course Creation with Authentication...');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      userEmail: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Step 2: Test course creation with JSON data
    console.log('2. Testing course creation with JSON data...');
    const courseData = {
      title: 'Test Course JSON',
      subject: 'mathematics',
      grade: '7',
      price: 100,
      duration: 10,
      level: 'beginner',
      description: 'Test course description with JSON data'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Course created successfully with JSON:', createResponse.data);
    
    // Step 3: Test course creation with FormData
    console.log('3. Testing course creation with FormData...');
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('title', 'Test Course FormData');
    formData.append('subject', 'mathematics');
    formData.append('grade', '7');
    formData.append('price', '100');
    formData.append('duration', '10');
    formData.append('level', 'beginner');
    formData.append('description', 'Test course description with FormData');
    
    const createFormResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Course created successfully with FormData:', createFormResponse.data);
    
    // Step 4: Test course creation with exams
    console.log('4. Testing course creation with exams...');
    const courseWithExams = {
      title: 'Test Course with Exams',
      subject: 'mathematics',
      grade: '7',
      price: 150,
      duration: 15,
      level: 'intermediate',
      description: 'Test course with exams',
      exams: JSON.stringify([
        {
          title: 'Math Quiz 1',
          type: 'internal_exam',
          duration: 30,
          passingScore: 60,
          questions: [
            {
              questionText: 'What is 2 + 2?',
              type: 'mcq',
              options: ['3', '4', '5', '6'],
              correctAnswer: 1,
              points: 1
            }
          ]
        }
      ])
    };
    
    const createWithExamsResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseWithExams, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Course with exams created successfully:', createWithExamsResponse.data);
    
    // Step 5: Get all courses to verify
    console.log('5. Getting all courses to verify...');
    const getAllCoursesResponse = await axios.get(`${API_BASE_URL}/api/admin/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Retrieved all courses:', getAllCoursesResponse.data);
    console.log(`Total courses: ${getAllCoursesResponse.data.length || getAllCoursesResponse.data.data?.length || 'Unknown'}`);
    
    console.log('✅ All course creation tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    if (error.request) {
      console.error('Request error:', error.request);
    }
  }
}

// Run the test
testCourseCreationWithAuth();
