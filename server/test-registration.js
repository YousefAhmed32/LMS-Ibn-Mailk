// server/test-registration.js - Test registration with new email
require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testRegistration() {
  try {
    console.log('🧪 Testing user registration...\n');

    // Generate a unique email
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;

    const registrationData = {
      firstName: 'محمد',
      secondName: 'أحمد',
      thirdName: 'علي',
      fourthName: 'حسن',
      email: testEmail,
      password: 'password123',
      role: 'student',
      phoneStudent: '01234567890',
      guardianPhone: '01123456789',
      governorate: 'Cairo',
      grade: 'أولى ثانوي'
    };

    console.log('📤 Sending registration request...');
    console.log('📧 Email:', testEmail);
    console.log('📋 Full data:', JSON.stringify(registrationData, null, 2));
    console.log('');

    const response = await axios.post(`${API_URL}/api/auth/register`, registrationData);

    console.log('✅ Registration successful!');
    console.log('📊 Response:', JSON.stringify({
      success: response.data.success,
      message: response.data.message,
      userId: response.data.data?._id,
      email: response.data.data?.email,
      role: response.data.data?.role,
      hasToken: !!response.data.token
    }, null, 2));

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
