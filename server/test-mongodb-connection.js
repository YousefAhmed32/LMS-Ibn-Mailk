const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    console.log('🔍 Testing MongoDB Connection Stability');
    console.log('=====================================');
    
    const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn';
    console.log('MongoDB URL:', MONGO_URL.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    // Test connection
    console.log('\n📡 Testing initial connection...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Ready State:', mongoose.connection.readyState);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Port:', mongoose.connection.port);
    
    // Test database operations
    console.log('\n📊 Testing database operations...');
    const User = require('./models/User');
    const Course = require('./models/Course');
    
    // Count collections
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    console.log('   Users:', userCount);
    console.log('   Courses:', courseCount);
    
    // Test a simple query
    console.log('\n🔍 Testing query operations...');
    const adminUsers = await User.find({ role: 'admin' }).limit(1);
    console.log('   Admin users found:', adminUsers.length);
    
    if (adminUsers.length > 0) {
      console.log('   Sample admin:', {
        id: adminUsers[0]._id,
        email: adminUsers[0].email,
        role: adminUsers[0].role
      });
    }
    
    // Test connection events
    console.log('\n🔌 Testing connection events...');
    mongoose.connection.on('connected', () => {
      console.log('   ✅ Connection event: connected');
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('   ⚠️ Connection event: disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.log('   ❌ Connection event: error', err.message);
    });
    
    // Test reconnection
    console.log('\n🔄 Testing reconnection...');
    await mongoose.disconnect();
    console.log('   Disconnected from MongoDB');
    
    await mongoose.connect(MONGO_URL);
    console.log('   Reconnected to MongoDB');
    
    // Final status
    console.log('\n📈 Final Connection Status:');
    console.log('   Ready State:', mongoose.connection.readyState);
    console.log('   Connection State:', mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected');
    
    console.log('\n✅ MongoDB connection stability test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testMongoDBConnection();
