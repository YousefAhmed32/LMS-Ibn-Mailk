// MongoDB Index Creation Script for Student Search Performance
// Run this script to create optimized indexes for student search functionality

const mongoose = require('mongoose');

async function createStudentSearchIndexes() {
  try {
    console.log('🔧 Creating student search indexes...');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    // 1. Compound index for role + active status + name fields
    await collection.createIndex(
      { 
        role: 1, 
        isActive: 1, 
        firstName: 1, 
        secondName: 1 
      },
      { 
        name: 'student_search_compound',
        background: true 
      }
    );
    
    // 2. Text index for full-text search across multiple fields
    await collection.createIndex(
      { 
        firstName: 'text', 
        secondName: 'text', 
        thirdName: 'text', 
        fourthName: 'text', 
        email: 'text',
        studentId: 'text'
      },
      { 
        name: 'student_text_search',
        background: true,
        weights: {
          firstName: 10,
          secondName: 10,
          thirdName: 5,
          fourthName: 5,
          email: 3,
          studentId: 8
        }
      }
    );
    
    // 3. Individual indexes for specific field searches
    await collection.createIndex(
      { role: 1, firstName: 1 },
      { name: 'role_firstname', background: true }
    );
    
    await collection.createIndex(
      { role: 1, secondName: 1 },
      { name: 'role_secondname', background: true }
    );
    
    await collection.createIndex(
      { role: 1, email: 1 },
      { name: 'role_email', background: true }
    );
    
    await collection.createIndex(
      { role: 1, studentId: 1 },
      { name: 'role_studentid', background: true }
    );
    
    console.log('✅ All student search indexes created successfully!');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
}

// Export for use in other scripts
module.exports = { createStudentSearchIndexes };

// If run directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/lms_database')
    .then(() => {
      console.log('🔌 Connected to MongoDB');
      return createStudentSearchIndexes();
    })
    .then(() => {
      console.log('🏁 Index creation completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}
