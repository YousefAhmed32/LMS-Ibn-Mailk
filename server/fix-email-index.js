// server/fix-email-index.js - Script to fix email indexes
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn";

async function fixEmailIndex() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB');

    // Use mongoose to get the model
    const User = require('./models/User');
    
    // Get the collection
    const collection = User.collection;

    console.log('\n📋 Current indexes on users collection:');
    const indexes = await collection.indexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Check if userEmail index exists
    const userEmailIndex = indexes.find(idx => idx.name === 'userEmail_1');
    if (userEmailIndex) {
      console.log('\n❌ Found old userEmail index. Dropping...');
      await collection.dropIndex('userEmail_1');
      console.log('✅ Dropped userEmail_1 index');
    } else {
      console.log('\n✅ No userEmail_1 index found');
    }

    // Check if email index exists
    const emailIndex = indexes.find(idx => idx.name === 'email_1' || idx.key?.email);
    if (!emailIndex) {
      console.log('\n📝 Creating email index...');
      await collection.createIndex({ email: 1 }, { unique: true, name: 'email_1' });
      console.log('✅ Created email_1 index');
    } else {
      console.log('\n✅ email_1 index already exists');
    }

    // Display final indexes
    console.log('\n📋 Final indexes:');
    const finalIndexes = await collection.indexes();
    console.log(JSON.stringify(finalIndexes, null, 2));

    console.log('\n✅ Index fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

fixEmailIndex();
