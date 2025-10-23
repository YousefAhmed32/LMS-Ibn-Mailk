#!/usr/bin/env node

/**
 * Test script to verify admin course navigation fixes
 * Tests both frontend navigation and backend API validation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAdminNavigationFix() {
  console.log('🧪 Testing Admin Course Navigation Fixes...\n');

  const results = {
    evidence: [],
    root_causes: [],
    code_changes: [],
    tests: [],
    remaining_issues: [],
    status: 'partial'
  };

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ Server is running:', healthResponse.data.message);
      results.tests.push({
        name: 'Server Health Check',
        command_or_action: 'GET /api/health',
        result: 'PASSED'
      });
    } catch (error) {
      console.log('❌ Server not running');
      results.tests.push({
        name: 'Server Health Check',
        command_or_action: 'GET /api/health',
        result: 'FAILED - Server not running'
      });
      results.status = 'failed';
      return results;
    }

    // Test 2: Test admin courses endpoint
    console.log('\n2️⃣ Testing admin courses endpoint...');
    try {
      const coursesResponse = await axios.get(`${BASE_URL}/api/admin/courses`);
      console.log('✅ Admin courses endpoint accessible');
      
      if (coursesResponse.data.success && coursesResponse.data.data) {
        const courses = coursesResponse.data.data;
        console.log(`📚 Found ${courses.length} courses`);
        
        if (courses.length > 0) {
          const firstCourse = courses[0];
          console.log('📝 First course structure:');
          console.log('  - _id:', firstCourse._id);
          console.log('  - _id type:', typeof firstCourse._id);
          console.log('  - title:', firstCourse.title);
          
          // Verify the course has _id as string
          if (firstCourse._id && typeof firstCourse._id === 'string') {
            console.log('✅ Course _id is string (fixed)');
            results.tests.push({
              name: 'Course ID Format Check',
              command_or_action: 'GET /api/admin/courses',
              result: 'PASSED - _id is string'
            });
          } else {
            console.log('❌ Course _id is not string');
            results.tests.push({
              name: 'Course ID Format Check',
              command_or_action: 'GET /api/admin/courses',
              result: 'FAILED - _id is not string'
            });
            results.remaining_issues.push('Course _id is not string format');
          }
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Admin courses endpoint requires authentication (expected)');
        results.tests.push({
          name: 'Admin Courses Authentication',
          command_or_action: 'GET /api/admin/courses',
          result: 'PASSED - Requires auth'
        });
      } else {
        console.log('❌ Admin courses endpoint error:', error.message);
        results.tests.push({
          name: 'Admin Courses Endpoint',
          command_or_action: 'GET /api/admin/courses',
          result: 'FAILED - ' + error.message
        });
        results.remaining_issues.push('Admin courses endpoint error: ' + error.message);
      }
    }

    // Test 3: Test invalid course ID validation
    console.log('\n3️⃣ Testing invalid course ID validation...');
    try {
      const invalidResponse = await axios.get(`${BASE_URL}/api/admin/courses/invalid-id`);
      console.log('❌ Invalid ID should return 400');
      results.remaining_issues.push('Backend validation not working for invalid IDs');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Backend correctly rejects invalid course ID');
        results.tests.push({
          name: 'Invalid ID Validation',
          command_or_action: 'GET /api/admin/courses/invalid-id',
          result: 'PASSED - Returns 400'
        });
      } else {
        console.log('❌ Unexpected error for invalid ID:', error.response?.status);
        results.remaining_issues.push('Unexpected error for invalid ID: ' + error.response?.status);
      }
    }

    // Test 4: Test [object Object] ID
    console.log('\n4️⃣ Testing [object Object] ID...');
    try {
      const objectResponse = await axios.get(`${BASE_URL}/api/admin/courses/[object Object]`);
      console.log('❌ [object Object] should return 400');
      results.remaining_issues.push('Backend validation not working for [object Object]');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Backend correctly rejects [object Object] ID');
        results.tests.push({
          name: '[object Object] ID Validation',
          command_or_action: 'GET /api/admin/courses/[object Object]',
          result: 'PASSED - Returns 400'
        });
      } else {
        console.log('❌ Unexpected error for [object Object]:', error.response?.status);
        results.remaining_issues.push('Unexpected error for [object Object]: ' + error.response?.status);
      }
    }

    console.log('\n🎉 Admin navigation fix tests completed!');
    
    // Determine final status
    if (results.remaining_issues.length === 0) {
      results.status = 'fixed';
    } else if (results.tests.length > 0) {
      results.status = 'partial';
    } else {
      results.status = 'failed';
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    results.status = 'failed';
    results.remaining_issues.push('Test execution failed: ' + error.message);
  }

  return results;
}

// Run the test and output results
testAdminNavigationFix().then(results => {
  console.log('\n📊 Final Results:');
  console.log(JSON.stringify(results, null, 2));
});
