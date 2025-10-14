const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let courseId = '';

// Test data
const testCourse = {
  title: "Advanced Mathematics - Grade 10",
  description: "Comprehensive mathematics course covering algebra, geometry, and trigonometry for Grade 10 students. This course provides in-depth understanding of mathematical concepts with practical examples and exercises.",
  grade: "Grade 10",
  term: "Term 1",
  subject: "Mathematics",
  price: 299.99,
  videos: [
    {
      title: "Introduction to Algebra",
      url: "https://example.com/videos/algebra-intro.mp4",
      duration: 45
    },
    {
      title: "Linear Equations",
      url: "https://example.com/videos/linear-equations.mp4",
      duration: 60
    },
    {
      title: "Quadratic Functions",
      url: "https://example.com/videos/quadratic-functions.mp4",
      duration: 75
    }
  ]
};

const updateData = {
  title: "Advanced Mathematics - Grade 10 (Updated)",
  price: 349.99,
  videos: [
    {
      title: "Introduction to Algebra",
      url: "https://example.com/videos/algebra-intro.mp4",
      duration: 45
    },
    {
      title: "Linear Equations",
      url: "https://example.com/videos/linear-equations.mp4",
      duration: 60
    },
    {
      title: "Quadratic Functions",
      url: "https://example.com/videos/quadratic-functions.mp4",
      duration: 75
    },
    {
      title: "Complex Numbers",
      url: "https://example.com/videos/complex-numbers.mp4",
      duration: 90
    }
  ]
};

// Test functions
async function testHealth() {
  try {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health check:', response.data.message);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
}

async function testLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      userEmail: "admin@example.com", // You'll need to create an admin user first
      password: "password123"
    });
    console.log('✅ Login successful:', response.data.message);
    authToken = response.data.token;
    return true;
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testCreateCourse() {
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }

  try {
    const response = await axios.post(`${BASE_URL}/courses`, testCourse, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Course creation successful:', response.data.message);
    courseId = response.data.course._id;
    return true;
  } catch (error) {
    console.log('❌ Course creation failed:', error.response?.data?.error || error.message);
    if (error.response?.data?.details) {
      console.log('Validation details:', error.response.data.details);
    }
    return false;
  }
}

async function testGetAllCourses() {
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get all courses successful:', `${response.data.courses.length} courses found`);
    return true;
  } catch (error) {
    console.log('❌ Get all courses failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testGetCourseById() {
  if (!authToken || !courseId) {
    console.log('❌ No auth token or course ID available');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get course by ID successful:', response.data.course.title);
    return true;
  } catch (error) {
    console.log('❌ Get course by ID failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testUpdateCourse() {
  if (!authToken || !courseId) {
    console.log('❌ No auth token or course ID available');
    return false;
  }

  try {
    const response = await axios.put(`${BASE_URL}/courses/${courseId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Course update successful:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Course update failed:', error.response?.data?.error || error.message);
    if (error.response?.data?.details) {
      console.log('Validation details:', error.response.data.details);
    }
    return false;
  }
}

async function testGetMyCourses() {
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/courses/creator/my-courses`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get my courses successful:', `${response.data.courses.length} courses found`);
    return true;
  } catch (error) {
    console.log('❌ Get my courses failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testDeactivateCourse() {
  if (!authToken || !courseId) {
    console.log('❌ No auth token or course ID available');
    return false;
  }

  try {
    const response = await axios.patch(`${BASE_URL}/courses/${courseId}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Course deactivation successful:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Course deactivation failed:', error.response?.data?.error || error.message);
    return false;
  }
}

async function testDeleteCourse() {
  if (!authToken || !courseId) {
    console.log('❌ No auth token or course ID available');
    return false;
  }

  try {
    const response = await axios.delete(`${BASE_URL}/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Course deletion successful:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Course deletion failed:', error.response?.data?.error || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Course API Tests...\n');
  
  await testHealth();
  console.log('');
  
  await testLogin();
  console.log('');
  
  if (authToken) {
    await testCreateCourse();
    console.log('');
    
    await testGetAllCourses();
    console.log('');
    
    await testGetCourseById();
    console.log('');
    
    await testUpdateCourse();
    console.log('');
    
    await testGetMyCourses();
    console.log('');
    
    await testDeactivateCourse();
    console.log('');
    
    await testDeleteCourse();
    console.log('');
  } else {
    console.log('⚠️  Skipping course tests due to authentication failure');
  }
  
  console.log('🏁 Course API Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testHealth,
  testLogin,
  testCreateCourse,
  testGetAllCourses,
  testGetCourseById,
  testUpdateCourse,
  testGetMyCourses,
  testDeactivateCourse,
  testDeleteCourse
};
