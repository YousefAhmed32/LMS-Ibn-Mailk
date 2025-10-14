const mongoose = require('mongoose');

// Simple test to check MongoDB connection
async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    
    await mongoose.connect('mongodb://localhost:27017/lms-ebn', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Test server endpoints
async function testEndpoints() {
  try {
    console.log('\n🌐 Testing server endpoints...');
    
    const response = await fetch('http://localhost:5000/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health endpoint working:', data);
    } else {
      console.log('❌ Health endpoint failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Starting simple tests...\n');
  
  await testConnection();
  await testEndpoints();
  
  console.log('\n🎉 Tests completed!');
}

runTests();
