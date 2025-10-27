const mongoose = require('mongoose');
const User = require('./models/User');

async function cleanDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms-ebn');
    console.log('✅ Connected to MongoDB');

    // Find all users
    const allUsers = await User.find({});
    console.log(`\n📊 Found ${allUsers.length} total users:`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}, Email: ${user.email}, Role: ${user.role}`);
    });

    // Delete all users with null or undefined emails
    const result = await User.deleteMany({ 
      $or: [
        { email: null },
        { email: undefined },
        { userEmail: null },
        { userEmail: undefined }
      ]
    });
    console.log(`\n🗑️ Deleted ${result.deletedCount} users with null/undefined emails`);

    // Check remaining users
    const remainingUsers = await User.find({});
    console.log(`\n📊 Remaining users: ${remainingUsers.length}`);
    
    remainingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}, Email: ${user.email}, Role: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanDatabase();
