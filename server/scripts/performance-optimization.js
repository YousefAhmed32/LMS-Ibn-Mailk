// Performance Optimization Script for LMS
// This script creates optimized indexes and improves database performance

const mongoose = require('mongoose');
require('dotenv').config();

async function optimizeDatabase() {
  try {
    console.log('🚀 Starting database performance optimization...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // 1. Users Collection Optimization
    console.log('\n📊 Optimizing Users collection...');
    const usersCollection = db.collection('users');
    
    // Compound indexes for common queries
    try {
      await usersCollection.createIndex(
        { role: 1, isActive: 1, createdAt: -1 },
        { name: 'role_active_created', background: true }
      );
    } catch (error) {
      console.log('⚠️ Users role_active_created index already exists or error:', error.message);
    }
    
    try {
      await usersCollection.createIndex(
        { role: 1, grade: 1, isActive: 1 },
        { name: 'role_grade_active', background: true }
      );
    } catch (error) {
      console.log('⚠️ Users role_grade_active index already exists or error:', error.message);
    }
    
    // Text search index for student search
    try {
      await usersCollection.createIndex(
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
    } catch (error) {
      console.log('⚠️ Users text search index already exists or error:', error.message);
    }
    
    // Index for parent-student relationships
    try {
      await usersCollection.createIndex(
        { parentId: 1, role: 1 },
        { name: 'parent_student', background: true }
      );
    } catch (error) {
      console.log('⚠️ Users parent_student index already exists or error:', error.message);
    }
    
    // 2. Courses Collection Optimization
    console.log('\n📚 Optimizing Courses collection...');
    const coursesCollection = db.collection('courses');
    
    try {
      await coursesCollection.createIndex(
        { isActive: 1, grade: 1, term: 1, createdAt: -1 },
        { name: 'active_grade_term_created', background: true }
      );
    } catch (error) {
      console.log('⚠️ Courses active_grade_term_created index already exists or error:', error.message);
    }
    
    try {
      await coursesCollection.createIndex(
        { createdBy: 1, isActive: 1 },
        { name: 'creator_active', background: true }
      );
    } catch (error) {
      console.log('⚠️ Courses creator_active index already exists or error:', error.message);
    }
    
    // Text search for course content
    try {
      await coursesCollection.createIndex(
        { 
          title: 'text', 
          description: 'text', 
          subject: 'text'
        },
        { 
          name: 'course_text_search',
          background: true,
          weights: {
            title: 10,
            subject: 8,
            description: 5
          }
        }
      );
    } catch (error) {
      console.log('⚠️ Courses text search index already exists or error:', error.message);
    }
    
    // 3. Groups Collection Optimization
    console.log('\n👥 Optimizing Groups collection...');
    const groupsCollection = db.collection('groups');
    
    try {
      await groupsCollection.createIndex(
        { createdBy: 1, isActive: 1 },
        { name: 'group_creator_active', background: true }
      );
    } catch (error) {
      console.log('⚠️ Groups creator_active index already exists or error:', error.message);
    }
    
    try {
      await groupsCollection.createIndex(
        { students: 1, isActive: 1 },
        { name: 'group_students_active', background: true }
      );
    } catch (error) {
      console.log('⚠️ Groups students_active index already exists or error:', error.message);
    }
    
    // 4. Progress Collection Optimization
    console.log('\n📈 Optimizing Progress collections...');
    
    // VideoProgress
    const videoProgressCollection = db.collection('videoprogresses');
    try {
      await videoProgressCollection.createIndex(
        { userId: 1, videoId: 1 },
        { name: 'user_video_progress', background: true, unique: true }
      );
    } catch (error) {
      console.log('⚠️ VideoProgress index already exists or error:', error.message);
    }
    
    try {
      await videoProgressCollection.createIndex(
        { userId: 1, courseId: 1, completedAt: -1 },
        { name: 'user_course_progress', background: true }
      );
    } catch (error) {
      console.log('⚠️ VideoProgress course index already exists or error:', error.message);
    }
    
    // UserCourseProgress
    const userCourseProgressCollection = db.collection('usercourseprogresses');
    try {
      await userCourseProgressCollection.createIndex(
        { userId: 1, courseId: 1 },
        { name: 'user_course_progress_new', background: true, unique: true }
      );
    } catch (error) {
      console.log('⚠️ UserCourseProgress index already exists or error:', error.message);
    }
    
    try {
      await userCourseProgressCollection.createIndex(
        { userId: 1, lastAccessedAt: -1 },
        { name: 'user_last_accessed', background: true }
      );
    } catch (error) {
      console.log('⚠️ UserCourseProgress lastAccessed index already exists or error:', error.message);
    }
    
    // 5. Notifications Collection Optimization
    console.log('\n🔔 Optimizing Notifications collection...');
    const notificationsCollection = db.collection('notifications');
    
    try {
      await notificationsCollection.createIndex(
        { userId: 1, isRead: 1, createdAt: -1 },
        { name: 'user_read_created', background: true }
      );
    } catch (error) {
      console.log('⚠️ Notifications user_read_created index already exists or error:', error.message);
    }
    
    try {
      await notificationsCollection.createIndex(
        { type: 1, createdAt: -1 },
        { name: 'type_created', background: true }
      );
    } catch (error) {
      console.log('⚠️ Notifications type_created index already exists or error:', error.message);
    }
    
    // 6. Exam Results Optimization
    console.log('\n📝 Optimizing Exam Results collection...');
    const examResultsCollection = db.collection('examresults');
    
    try {
      await examResultsCollection.createIndex(
        { studentId: 1, examId: 1 },
        { name: 'student_exam_result', background: true, unique: true }
      );
    } catch (error) {
      console.log('⚠️ ExamResults student_exam_result index already exists or error:', error.message);
    }
    
    try {
      await examResultsCollection.createIndex(
        { studentId: 1, submittedAt: -1 },
        { name: 'student_submitted', background: true }
      );
    } catch (error) {
      console.log('⚠️ ExamResults student_submitted index already exists or error:', error.message);
    }
    
    // 7. Payment Proofs Optimization
    console.log('\n💳 Optimizing Payment Proofs collection...');
    const paymentProofsCollection = db.collection('paymentproofs');
    
    try {
      await paymentProofsCollection.createIndex(
        { status: 1, createdAt: -1 },
        { name: 'status_created', background: true }
      );
    } catch (error) {
      console.log('⚠️ PaymentProofs status_created index already exists or error:', error.message);
    }
    
    try {
      await paymentProofsCollection.createIndex(
        { userId: 1, status: 1 },
        { name: 'user_status', background: true }
      );
    } catch (error) {
      console.log('⚠️ PaymentProofs user_status index already exists or error:', error.message);
    }
    
    console.log('\n✅ Database optimization completed successfully!');
    
    // Display all indexes
    console.log('\n📋 Current indexes summary:');
    const collections = ['users', 'courses', 'groups', 'videoprogresses', 'usercourseprogresses', 'notifications', 'examresults', 'paymentproofs'];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        console.log(`\n${collectionName}: ${indexes.length} indexes`);
        indexes.forEach(index => {
          console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
        });
      } catch (error) {
        console.log(`\n${collectionName}: Collection not found or error`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during optimization:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run optimization
optimizeDatabase();
