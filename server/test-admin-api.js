const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';

// Test data
const testUser = {
  firstName: 'Admin',
  secondName: 'User',
  userEmail: 'admin@test.com',
  password: 'admin123',
  role: 'admin',
  grade: 'Grade 12',
  term: 'Term 1',
  governorate: 'Cairo'
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method} ${endpoint} failed:`, error.response?.data || error.message);
    return null;
  }
};

// Test functions
const testAdminAuth = async () => {
  console.log('\n🔐 Testing Admin Authentication...');
  
  try {
    // First, try to register the admin user
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Admin user registered:', registerResponse.data.success);
    
    // Login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      userEmail: testUser.userEmail,
      password: testUser.password
    });
    
    if (loginResponse.data.success && loginResponse.data.token) {
      adminToken = loginResponse.data.token;
      console.log('✅ Admin login successful, token received');
      return true;
    } else {
      console.log('❌ Admin login failed');
      return false;
    }
  } catch (error) {
    // If user already exists, try to login
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        userEmail: testUser.userEmail,
        password: testUser.password
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        adminToken = loginResponse.data.token;
        console.log('✅ Admin login successful, token received');
        return true;
      }
    } catch (loginError) {
      console.log('❌ Admin login failed:', loginError.response?.data || loginError.message);
      return false;
    }
  }
  
  return false;
};

const testDashboardOverview = async () => {
  console.log('\n📊 Testing Dashboard Overview...');
  
  const response = await makeAuthRequest('GET', '/admin/dashboard');
  if (response) {
    console.log('✅ Dashboard overview:', {
      totalStudents: response.data.overview.totalStudents,
      totalCourses: response.data.overview.totalCourses,
      totalPayments: response.data.overview.totalPayments,
      pendingPayments: response.data.overview.pendingPayments,
      totalRevenue: response.data.overview.totalRevenue
    });
  }
};

const testUsersAnalytics = async () => {
  console.log('\n👥 Testing Users Analytics...');
  
  const response = await makeAuthRequest('GET', '/admin/analytics/users');
  if (response) {
    console.log('✅ Users analytics:', {
      totalStudents: response.data.totalStudents,
      studentsPerGrade: response.data.studentsPerGrade?.length || 0,
      studentsPerGovernorate: response.data.studentsPerGovernorate?.length || 0,
      recentRegistrations: response.data.recentRegistrations
    });
  }
};

const testCoursesAnalytics = async () => {
  console.log('\n📚 Testing Courses Analytics...');
  
  const response = await makeAuthRequest('GET', '/admin/analytics/courses');
  if (response) {
    console.log('✅ Courses analytics:', {
      totalCourses: response.data.totalCourses,
      activeCourses: response.data.activeCourses,
      coursesPerGrade: response.data.coursesPerGrade?.length || 0,
      topCoursesByEnrollment: response.data.topCoursesByEnrollment?.length || 0
    });
  }
};

const testPaymentsAnalytics = async () => {
  console.log('\n💰 Testing Payments Analytics...');
  
  const response = await makeAuthRequest('GET', '/admin/analytics/payments');
  if (response) {
    console.log('✅ Payments analytics:', {
      totalPayments: response.data.totalPayments,
      totalRevenue: response.data.totalRevenue,
      pendingPayments: response.data.pendingPayments,
      rejectedPayments: response.data.rejectedPayments
    });
  }
};

const testActivityAnalytics = async () => {
  console.log('\n📈 Testing Activity Analytics...');
  
  const response = await makeAuthRequest('GET', '/admin/analytics/activity');
  if (response) {
    console.log('✅ Activity analytics:', {
      courseActivity: response.data.courseActivity?.length || 0,
      recentEnrollments: response.data.recentEnrollments?.length || 0
    });
  }
};

const testUsersManagement = async () => {
  console.log('\n👤 Testing Users Management...');
  
  const response = await makeAuthRequest('GET', '/admin/users?limit=5');
  if (response) {
    console.log('✅ Users management:', {
      usersCount: response.data.users?.length || 0,
      totalUsers: response.data.pagination?.totalUsers || 0,
      currentPage: response.data.pagination?.currentPage || 1
    });
  }
};

const testCoursesManagement = async () => {
  console.log('\n📖 Testing Courses Management...');
  
  const response = await makeAuthRequest('GET', '/admin/courses?limit=5');
  if (response) {
    console.log('✅ Courses management:', {
      coursesCount: response.data.courses?.length || 0,
      totalCourses: response.data.pagination?.totalCourses || 0,
      currentPage: response.data.pagination?.currentPage || 1
    });
  }
};

const testPaymentsManagement = async () => {
  console.log('\n💳 Testing Payments Management...');
  
  const response = await makeAuthRequest('GET', '/admin/payments?limit=5');
  if (response) {
    console.log('✅ Payments management:', {
      paymentsCount: response.data.payments?.length || 0,
      totalPayments: response.data.pagination?.totalPayments || 0,
      currentPage: response.data.pagination?.currentPage || 1
    });
  }
};

const testExportUsers = async () => {
  console.log('\n📤 Testing Export Users...');
  
  const response = await makeAuthRequest('GET', '/admin/export/users?format=json&limit=5');
  if (response) {
    console.log('✅ Export users:', {
      success: response.success,
      dataCount: response.data?.length || 0
    });
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Admin API Tests...\n');
  
  // Test authentication first
  const authSuccess = await testAdminAuth();
  if (!authSuccess) {
    console.log('❌ Authentication failed. Cannot proceed with admin tests.');
    return;
  }
  
  // Run all tests
  await testDashboardOverview();
  await testUsersAnalytics();
  await testCoursesAnalytics();
  await testPaymentsAnalytics();
  await testActivityAnalytics();
  await testUsersManagement();
  await testCoursesManagement();
  await testPaymentsManagement();
  await testExportUsers();
  
  console.log('\n🎉 All admin API tests completed!');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testAdminAuth,
  testDashboardOverview,
  testUsersAnalytics,
  testCoursesAnalytics,
  testPaymentsAnalytics,
  testActivityAnalytics,
  testUsersManagement,
  testCoursesManagement,
  testPaymentsManagement,
  testExportUsers
};
