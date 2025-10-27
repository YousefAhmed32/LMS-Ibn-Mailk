const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function createAdminViaAPI() {
  try {
    console.log('🧪 Creating Admin User via API...');
    
    // First, let's try to register an admin user directly
    console.log('1. Attempting to register admin user...');
    
    const adminData = {
      firstName: 'API',
      secondName: 'Admin',
      thirdName: 'User',
      fourthName: 'Admin',
      email: 'api.admin@example.com',
      password: 'admin123',
      role: 'admin',
      phoneFather: '+201234567890',
      phoneMother: '+201234567891'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, adminData);
      console.log('✅ Admin registration successful:', registerResponse.data);
      
      // Test login with the new admin
      console.log('\n2. Testing login with new admin...');
      
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        userEmail: 'api.admin@example.com',
        password: 'admin123'
      });
      
      console.log('✅ Admin login successful:', loginResponse.data);
      
      // Test course creation with the new admin
      console.log('\n3. Testing course creation with new admin...');
      
      const courseData = {
        title: 'Test Course from API Admin',
        subject: 'mathematics',
        grade: '7',
        price: 100,
        duration: 10,
        level: 'beginner',
        description: 'Test course created by API admin'
      };
      
      const createResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Course creation successful:', createResponse.data);
      
      // Test getting all courses
      console.log('\n4. Testing get all courses...');
      
      const getAllCoursesResponse = await axios.get(`${API_BASE_URL}/api/admin/courses`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('✅ Get all courses successful:', getAllCoursesResponse.data);
      
    } catch (error) {
      console.log('❌ Admin registration failed:', error.response?.data || error.message);
      
      // If registration fails, try to login with existing admin
      console.log('\n2. Trying to login with existing admin...');
      
      const existingAdmins = [
        'admin@example.com',
        'admin@test.com',
        'admin2@gmail.com'
      ];
      
      for (const email of existingAdmins) {
        console.log(`\n🔍 Trying login with: ${email}`);
        
        try {
          const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            userEmail: email,
            password: 'admin123'
          });
          
          console.log('✅ Login successful with:', email);
          console.log('Response:', loginResponse.data);
          
          // Test course creation
          console.log('\n3. Testing course creation...');
          
          const courseData = {
            title: 'Test Course from Existing Admin',
            subject: 'mathematics',
            grade: '7',
            price: 100,
            duration: 10,
            level: 'beginner',
            description: 'Test course created by existing admin'
          };
          
          const createResponse = await axios.post(`${API_BASE_URL}/api/admin/courses`, courseData, {
            headers: {
              'Authorization': `Bearer ${loginResponse.data.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Course creation successful:', createResponse.data);
          return; // Exit on first success
          
        } catch (loginError) {
          console.log('❌ Login failed with:', email);
          console.log('Error:', loginError.response?.data || loginError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

createAdminViaAPI();
