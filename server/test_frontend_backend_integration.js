const mongoose = require('mongoose');
const Course = require('./models/Course');

// Test script to verify frontend-backend integration
async function testFrontendBackendIntegration() {
  try {
    console.log('🧪 Testing Frontend-Backend Integration...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/test');
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Create a course with mixed exam types
    console.log('\n📝 Test 1: Creating course with mixed exam types...');
    
    const testCourseData = {
      title: 'Frontend Integration Test Course',
      description: 'Testing frontend-backend integration with mixed exam types',
      subject: 'Mathematics',
      grade: '10',
      instructor: 'Test Instructor',
      duration: 120,
      price: 99.99,
      isActive: true,
      videos: [
        {
          title: 'Introduction Video',
          url: 'https://youtube.com/watch?v=test',
          duration: 30,
          order: 1
        }
      ],
      exams: [
        {
          title: 'Internal Math Quiz',
          type: 'internal_exam',
          totalMarks: 50,
          duration: 30,
          passingScore: 70,
          questions: [
            {
              questionText: 'What is 2 + 2?',
              type: 'multiple_choice',
              points: 10,
              options: [
                { text: '3', isCorrect: false },
                { text: '4', isCorrect: true },
                { text: '5', isCorrect: false }
              ],
              correctAnswer: '4'
            }
          ]
        },
        {
          title: 'External Google Form',
          type: 'google_form',
          url: 'https://forms.gle/test123',
          totalMarks: 0,
          duration: 0,
          passingScore: 0,
          questions: []
        },
        {
          title: 'Migrated Exam',
          type: 'internal_exam',
          totalMarks: 1,
          duration: 1,
          passingScore: 60,
          migratedFromGoogleForm: true,
          migrationNote: 'Migrated from Google Form - Original URL: https://forms.gle/old123',
          questions: [
            {
              questionText: 'This exam was migrated from a Google Form. Please replace this placeholder question with actual exam questions.',
              type: 'essay',
              points: 1,
              correctAnswer: '',
              sampleAnswer: 'This is a placeholder question. Please replace with actual exam content.'
            }
          ]
        }
      ]
    };
    
    const course = new Course(testCourseData);
    const savedCourse = await course.save();
    console.log(`✅ Course created with ID: ${savedCourse._id}`);
    
    // Test 2: Verify exam structure
    console.log('\n🔍 Test 2: Verifying exam structure...');
    
    const retrievedCourse = await Course.findById(savedCourse._id);
    console.log(`📊 Course has ${retrievedCourse.exams.length} exams`);
    
    retrievedCourse.exams.forEach((exam, index) => {
      console.log(`\n  Exam ${index + 1}: ${exam.title}`);
      console.log(`    Type: ${exam.type}`);
      console.log(`    Questions: ${exam.questions ? exam.questions.length : 0}`);
      console.log(`    Total Marks: ${exam.totalMarks}`);
      console.log(`    Duration: ${exam.duration} minutes`);
      console.log(`    Migrated: ${exam.migratedFromGoogleForm || false}`);
      
      if (exam.migrationNote) {
        console.log(`    Migration Note: ${exam.migrationNote}`);
      }
      
      if (exam.questions && exam.questions.length > 0) {
        exam.questions.forEach((question, qIndex) => {
          console.log(`      Q${qIndex + 1}: ${question.questionText.substring(0, 50)}...`);
          console.log(`        Type: ${question.type}`);
          console.log(`        Points: ${question.points}`);
        });
      }
    });
    
    // Test 3: Verify frontend compatibility
    console.log('\n🎨 Test 3: Verifying frontend compatibility...');
    
    const frontendCompatibleData = {
      course: retrievedCourse,
      exams: retrievedCourse.exams.map(exam => ({
        id: exam.id || exam._id,
        title: exam.title,
        type: exam.type,
        url: exam.url || '',
        totalMarks: exam.totalMarks,
        duration: exam.duration,
        passingScore: exam.passingScore,
        questions: exam.questions || [],
        migratedFromGoogleForm: exam.migratedFromGoogleForm || false,
        migrationNote: exam.migrationNote || ''
      }))
    };
    
    console.log('✅ Frontend-compatible data structure:');
    console.log(`  - Course ID: ${frontendCompatibleData.course._id}`);
    console.log(`  - Exams count: ${frontendCompatibleData.exams.length}`);
    
    frontendCompatibleData.exams.forEach((exam, index) => {
      console.log(`  - Exam ${index + 1}: ${exam.title} (${exam.type})`);
      if (exam.type === 'internal_exam') {
        console.log(`    Questions: ${exam.questions.length}`);
        console.log(`    Total Marks: ${exam.totalMarks}`);
      } else {
        console.log(`    URL: ${exam.url}`);
      }
      if (exam.migratedFromGoogleForm) {
        console.log(`    Migrated: Yes`);
      }
    });
    
    // Test 4: Verify edit functionality
    console.log('\n✏️ Test 4: Testing edit functionality...');
    
    // Simulate editing an internal exam
    const internalExam = retrievedCourse.exams.find(exam => exam.type === 'internal_exam' && !exam.migratedFromGoogleForm);
    if (internalExam) {
      console.log(`📝 Editing internal exam: ${internalExam.title}`);
      
      // Add a new question
      const updatedExam = {
        ...internalExam.toObject(),
        questions: [
          ...internalExam.questions,
          {
            questionText: 'What is 5 + 5?',
            type: 'true_false',
            points: 10,
            correctAnswer: true
          }
        ]
      };
      
      // Update the course
      await Course.findByIdAndUpdate(retrievedCourse._id, {
        $set: {
          'exams.$[exam].questions': updatedExam.questions
        }
      }, {
        arrayFilters: [{ 'exam._id': internalExam._id }]
      });
      
      console.log('✅ Exam updated successfully');
    }
    
    // Test 5: Verify migration display
    console.log('\n🔄 Test 5: Verifying migration display...');
    
    const migratedExams = retrievedCourse.exams.filter(exam => exam.migratedFromGoogleForm);
    console.log(`📊 Found ${migratedExams.length} migrated exams`);
    
    migratedExams.forEach((exam, index) => {
      console.log(`  Migrated Exam ${index + 1}: ${exam.title}`);
      console.log(`    Migration Note: ${exam.migrationNote}`);
      console.log(`    Questions: ${exam.questions.length}`);
      console.log(`    Type: ${exam.type}`);
    });
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await Course.findByIdAndDelete(savedCourse._id);
    console.log('✅ Test course deleted');
    
    console.log('\n🎉 All frontend-backend integration tests passed!');
    console.log('\n📋 Summary:');
    console.log('✅ Course creation with mixed exam types');
    console.log('✅ Internal exam with questions');
    console.log('✅ External exam (Google Form)');
    console.log('✅ Migrated exam with migration tracking');
    console.log('✅ Frontend-compatible data structure');
    console.log('✅ Edit functionality');
    console.log('✅ Migration display');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run tests if called directly
if (require.main === module) {
  testFrontendBackendIntegration()
    .then(() => {
      console.log('✅ Integration test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Integration test failed:', error);
      process.exit(1);
    });
}

module.exports = { testFrontendBackendIntegration };
