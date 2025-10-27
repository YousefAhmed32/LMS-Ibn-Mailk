// Frontend Integration Test
// This test simulates frontend API calls and socket connections

const testFrontendIntegration = async () => {
  console.log('🧪 Starting Frontend Integration Tests...\n');

  const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const testResults = {
    apiConnection: false,
    imageUpload: false,
    courseCreation: false,
    errorHandling: false
  };

  try {
    // Test 1: API Connection
    console.log('🌐 Test 1: API Connection');
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        testResults.apiConnection = true;
        console.log('✅ API connection: PASSED');
        console.log(`   Server status: ${data.status}`);
        console.log(`   Server uptime: ${data.uptime}s`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log('❌ API connection: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 2: Image Upload (Simulated)
    console.log('📤 Test 2: Image Upload (Simulated)');
    try {
      // Create a test image blob
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 100, 100);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('image', blob, 'test-image.png');

        const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            testResults.imageUpload = true;
            console.log('✅ Image upload: PASSED');
            console.log(`   Image ID: ${data.data.id}`);
            console.log(`   Image URL: ${data.data.url}`);
          } else {
            throw new Error(data.message || 'Upload failed');
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }, 'image/png');
    } catch (error) {
      console.log('❌ Image upload: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 3: Course Creation (Simulated)
    console.log('📚 Test 3: Course Creation (Simulated)');
    try {
      const courseData = {
        title: 'Frontend Test Course',
        description: 'A course created from frontend test',
        subject: 'mathematics',
        grade: '7',
        price: 100,
        duration: 15,
        level: 'beginner',
        videos: JSON.stringify([]),
        exams: JSON.stringify([])
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // Mock token
        },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          testResults.courseCreation = true;
          console.log('✅ Course creation: PASSED');
          console.log(`   Course ID: ${data.data._id}`);
          console.log(`   Course Title: ${data.data.title}`);
        } else {
          throw new Error(data.message || 'Course creation failed');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log('❌ Course creation: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 4: Error Handling
    console.log('❌ Test 4: Error Handling');
    try {
      const response = await fetch(`${API_BASE_URL}/api/nonexistent-endpoint`);
      if (!response.ok) {
        testResults.errorHandling = true;
        console.log('✅ Error handling: PASSED');
        console.log(`   Correctly returned ${response.status} for non-existent endpoint`);
      } else {
        throw new Error('Should have returned error for non-existent endpoint');
      }
    } catch (error) {
      console.log('❌ Error handling: FAILED');
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test Summary
    console.log('📊 Frontend Integration Test Summary:');
    console.log('=====================================');
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    
    Object.entries(testResults).forEach(([test, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log(`\n🎯 Frontend Integration Result: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All frontend integration tests passed!');
      return testResults;
    } else {
      console.log('\n⚠️ Some frontend integration tests failed.');
      throw new Error('Frontend integration tests failed');
    }

  } catch (error) {
    console.error('❌ Frontend integration test failed:', error.message);
    throw error;
  }
};

// Socket.io Connection Test for Frontend
const testFrontendSocketConnection = async () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔌 Testing Frontend Socket.io Connection...');
    
    const serverUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
    console.log(`   Connecting to: ${serverUrl}`);
    
    // Import socket.io-client dynamically
    import('socket.io-client').then(({ io }) => {
      const socket = io(serverUrl, {
        transports: ['polling', 'websocket'],
        timeout: 10000,
        reconnection: false
      });

      let connectionEstablished = false;
      const timeout = setTimeout(() => {
        if (!connectionEstablished) {
          console.log('❌ Socket connection timeout');
          socket.disconnect();
          reject(new Error('Socket connection timeout'));
        }
      }, 10000);

      socket.on('connect', () => {
        connectionEstablished = true;
        clearTimeout(timeout);
        console.log('✅ Frontend socket connected successfully');
        console.log(`   Socket ID: ${socket.id}`);
        
        // Test joining a room
        socket.emit('join', 'frontend-test-user');
        
        setTimeout(() => {
          socket.disconnect();
        }, 1000);
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.log('❌ Frontend socket connection error:', error.message);
        reject(error);
      });

      socket.on('disconnect', (reason) => {
        console.log('✅ Frontend socket disconnected cleanly');
        console.log(`   Reason: ${reason}`);
        resolve(true);
      });
    }).catch(error => {
      console.log('❌ Failed to import socket.io-client:', error.message);
      reject(error);
    });
  });
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && require.main === module) {
  testFrontendIntegration()
    .then(() => testFrontendSocketConnection())
    .then(() => {
      console.log('\n✅ All frontend tests completed successfully');
    })
    .catch((error) => {
      console.error('\n❌ Frontend tests failed:', error.message);
    });
}

export { testFrontendIntegration, testFrontendSocketConnection };

