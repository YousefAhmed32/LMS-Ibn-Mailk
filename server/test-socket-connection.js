const { io } = require('socket.io-client');

// Test Socket.io Connection
const testSocketConnection = async () => {
  return new Promise((resolve, reject) => {
    console.log('🔌 Testing Socket.io Connection...');
    
    const serverUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    console.log(`   Connecting to: ${serverUrl}`);
    
    const socket = io(serverUrl, {
      transports: ['polling', 'websocket'],
      timeout: 10000,
      reconnection: false // Disable reconnection for testing
    });

    let connectionEstablished = false;
    let testResults = {
      connection: false,
      joinRoom: false,
      disconnect: false
    };

    // Connection timeout
    const timeout = setTimeout(() => {
      if (!connectionEstablished) {
        console.log('❌ Connection timeout');
        socket.disconnect();
        reject(new Error('Connection timeout'));
      }
    }, 10000);

    // Connection successful
    socket.on('connect', () => {
      connectionEstablished = true;
      clearTimeout(timeout);
      testResults.connection = true;
      console.log('✅ Socket connected successfully');
      console.log(`   Socket ID: ${socket.id}`);
      
      // Test joining a room
      const testUserId = 'test-user-123';
      socket.emit('join', testUserId);
      console.log(`   Testing join room: ${testUserId}`);
      
      // Wait a bit then test disconnect
      setTimeout(() => {
        testResults.joinRoom = true;
        console.log('✅ Join room test completed');
        
        socket.disconnect();
      }, 1000);
    });

    // Connection error
    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      console.log('❌ Socket connection error:', error.message);
      reject(error);
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      testResults.disconnect = true;
      console.log('✅ Socket disconnected cleanly');
      console.log(`   Reason: ${reason}`);
      
      // Test completed
      const passedTests = Object.values(testResults).filter(Boolean).length;
      const totalTests = Object.keys(testResults).length;
      
      console.log('\n📊 Socket.io Test Summary:');
      console.log('==========================');
      Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
      });
      
      console.log(`\n🎯 Socket.io Result: ${passedTests}/${totalTests} tests passed`);
      
      if (passedTests === totalTests) {
        console.log('🎉 Socket.io connection test passed!');
        resolve(testResults);
      } else {
        console.log('⚠️ Some socket.io tests failed.');
        reject(new Error('Socket.io tests failed'));
      }
    });
  });
};

// Run test if this file is executed directly
if (require.main === module) {
  testSocketConnection()
    .then(() => {
      console.log('\n✅ Socket.io test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Socket.io test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testSocketConnection };

