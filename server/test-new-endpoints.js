// Test script for the new enrollment endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const TEST_CONFIG = {
  adminEmail: 'admin@example.com',
  adminPassword: 'admin123',
  studentEmail: 'student@example.com',
  studentPassword: 'student123'
};

async function testNewEndpoints() {
  try {
    console.log('🧪 Testing new enrollment endpoints...\n');

    // Test 1: Admin login
    console.log('1. Testing admin login...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userEmail: TEST_CONFIG.adminEmail,
      password: TEST_CONFIG.adminPassword
    });
    
    if (adminLoginResponse.data.success) {
      console.log('✅ Admin login successful');
      const adminToken = adminLoginResponse.data.token;
      
      // Test 2: Get admin user profile with populated enrolledCourses
      console.log('\n2. Testing GET /api/auth/me with populated data...');
      const userMeResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (userMeResponse.data.success) {
        console.log('✅ GET /api/auth/me successful');
        console.log('   User enrolledCourses:', userMeResponse.data.user.enrolledCourses?.length || 0);
        console.log('   User allowedCourses:', userMeResponse.data.user.allowedCourses?.length || 0);
      } else {
        console.log('❌ GET /api/auth/me failed');
      }
      
      // Test 3: Get pending payments
      console.log('\n3. Testing GET /api/admin/payment-proofs/pending...');
      const pendingPaymentsResponse = await axios.get(`${BASE_URL}/admin/payment-proofs/pending`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      if (pendingPaymentsResponse.data.success) {
        console.log('✅ GET pending payments successful');
        const payments = pendingPaymentsResponse.data.data;
        console.log(`   Found ${payments.length} pending payments`);
        
        if (payments.length > 0) {
          const firstPayment = payments[0];
          console.log(`   First payment ID: ${firstPayment._id}`);
          console.log(`   Payment status: ${firstPayment.status}`);
          
          // Test 4: Test new order approval endpoint
          console.log('\n4. Testing POST /api/admin/orders/:orderId/approve...');
          try {
            const approveResponse = await axios.post(`${BASE_URL}/admin/orders/${firstPayment._id}/approve`, {}, {
              headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            
            if (approveResponse.data.success) {
              console.log('✅ Order approval successful');
              console.log('   Response:', approveResponse.data.message);
            } else {
              console.log('❌ Order approval failed:', approveResponse.data.error);
            }
          } catch (approveError) {
            if (approveError.response?.status === 200 && approveError.response?.data?.alreadyApproved) {
              console.log('✅ Order already approved (idempotent)');
            } else {
              console.log('❌ Order approval error:', approveError.response?.data?.error || approveError.message);
            }
          }
        }
      } else {
        console.log('❌ GET pending payments failed');
      }
      
    } else {
      console.log('❌ Admin login failed');
    }

    // Test 5: Student login and course access
    console.log('\n5. Testing student login and course access...');
    const studentLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userEmail: TEST_CONFIG.studentEmail,
      password: TEST_CONFIG.studentPassword
    });
    
    if (studentLoginResponse.data.success) {
      console.log('✅ Student login successful');
      const studentToken = studentLoginResponse.data.token;
      
      // Test course access endpoint
      console.log('\n6. Testing GET /api/courses/:courseId/access...');
      try {
        const courseAccessResponse = await axios.get(`${BASE_URL}/courses/507f1f77bcf86cd799439011/access`, {
          headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        
        if (courseAccessResponse.data.success) {
          console.log('✅ Course access check successful');
          console.log('   Has access:', courseAccessResponse.data.access);
        } else {
          console.log('❌ Course access check failed');
        }
      } catch (accessError) {
        console.log('❌ Course access error:', accessError.response?.data?.error || accessError.message);
      }
      
    } else {
      console.log('❌ Student login failed');
    }

    console.log('\n🎉 Endpoint testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testNewEndpoints();
