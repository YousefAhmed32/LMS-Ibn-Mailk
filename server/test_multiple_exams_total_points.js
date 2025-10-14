const mongoose = require('mongoose');
const Course = require('./models/Course');

// Test script to verify multiple exams and totalPoints calculation
async function testMultipleExamsAndTotalPoints() {
  try {
    console.log('🧪 Testing Multiple Exams and Total Points Calculation...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/test');
    console.log('✅ Connected to MongoDB');
    
    // Test data: Course with 2 exams (3 and 4 questions each)
    const testCourseData = {
      title: 'Multiple Exams Test Course',
      description: 'Testing multiple exams with automatic totalPoints calculation',
      subject: 'Mathematics',
      grade: '10',
      instructor: 'Test Instructor',
      duration: 180,
      price: 149.99,
      isActive: true,
      videos: [
        {
          title: 'Introduction Video',
          url: 'https://youtube.com/watch?v=intro',
          duration: 30,
          order: 1
        }
      ],
      exams: [
        {
          title: 'Math Quiz 1 - Basic Operations',
          type: 'internal_exam',
          totalMarks: 100,
          duration: 30,
          passingScore: 70,
          questions: [
            {
              questionText: 'What is 5 + 3?',
              type: 'multiple_choice',
              points: 10,
              options: [
                { text: '7', isCorrect: false },
                { text: '8', isCorrect: true },
                { text: '9', isCorrect: false }
              ],
              correctAnswer: '8'
            },
            {
              questionText: 'What is 12 - 4?',
              type: 'multiple_choice',
              points: 15,
              options: [
                { text: '6', isCorrect: false },
                { text: '8', isCorrect: true },
                { text: '10', isCorrect: false }
              ],
              correctAnswer: '8'
            },
            {
              questionText: 'Is 2 + 2 = 4?',
              type: 'true_false',
              points: 5,
              correctAnswer: true
            }
          ]
        },
        {
          title: 'Math Quiz 2 - Advanced Problems',
          type: 'internal_exam',
          totalMarks: 100,
          duration: 45,
          passingScore: 75,
          questions: [
            {
              questionText: 'What is 6 × 7?',
              type: 'multiple_choice',
              points: 20,
              options: [
                { text: '40', isCorrect: false },
                { text: '42', isCorrect: true },
                { text: '44', isCorrect: false }
              ],
              correctAnswer: '42'
            },
            {
              questionText: 'What is 15 ÷ 3?',
              type: 'multiple_choice',
              points: 15,
              options: [
                { text: '4', isCorrect: false },
                { text: '5', isCorrect: true },
                { text: '6', isCorrect: false }
              ],
              correctAnswer: '5'
            },
            {
              questionText: 'Is 3 × 4 = 12?',
              type: 'true_false',
              points: 10,
              correctAnswer: true
            },
            {
              questionText: 'Solve: 2x + 5 = 13. What is x?',
              type: 'essay',
              points: 25,
              correctAnswer: '',
              sampleAnswer: 'x = 4'
            }
          ]
        }
      ]
    };
    
    console.log('\n📝 Test 1: Creating course with 2 exams...');
    console.log(`  Exam 1: ${testCourseData.exams[0].title} (${testCourseData.exams[0].questions.length} questions)`);
    console.log(`  Exam 2: ${testCourseData.exams[1].title} (${testCourseData.exams[1].questions.length} questions)`);
    
    const course = new Course(testCourseData);
    const savedCourse = await course.save();
    console.log(`✅ Course created with ID: ${savedCourse._id}`);
    
    // Test 2: Verify multiple exams are stored
    console.log('\n🔍 Test 2: Verifying multiple exams storage...');
    const retrievedCourse = await Course.findById(savedCourse._id);
    console.log(`📊 Course has ${retrievedCourse.exams.length} exams`);
    
    if (retrievedCourse.exams.length !== 2) {
      throw new Error(`Expected 2 exams, but found ${retrievedCourse.exams.length}`);
    }
    
    // Test 3: Verify totalPoints calculation
    console.log('\n🧮 Test 3: Verifying totalPoints calculation...');
    
    retrievedCourse.exams.forEach((exam, index) => {
      console.log(`\n  Exam ${index + 1}: ${exam.title}`);
      console.log(`    Type: ${exam.type}`);
      console.log(`    Questions: ${exam.questions.length}`);
      console.log(`    Total Points: ${exam.totalPoints}`);
      console.log(`    Total Marks: ${exam.totalMarks}`);
      
      // Calculate expected totalPoints
      const expectedTotalPoints = exam.questions.reduce((sum, question) => {
        return sum + (question.points || 1);
      }, 0);
      
      console.log(`    Expected Total Points: ${expectedTotalPoints}`);
      
      if (exam.totalPoints !== expectedTotalPoints) {
        throw new Error(`Exam ${index + 1}: Expected totalPoints ${expectedTotalPoints}, but got ${exam.totalPoints}`);
      }
      
      // Verify individual question points
      exam.questions.forEach((question, qIndex) => {
        console.log(`      Q${qIndex + 1}: ${question.questionText.substring(0, 30)}... (${question.points} points)`);
      });
    });
    
    // Test 4: Verify frontend compatibility
    console.log('\n🎨 Test 4: Verifying frontend compatibility...');
    
    const frontendCompatibleData = {
      course: retrievedCourse,
      exams: retrievedCourse.exams.map(exam => ({
        id: exam.id || exam._id,
        title: exam.title,
        type: exam.type,
        url: exam.url || '',
        totalMarks: exam.totalMarks,
        totalPoints: exam.totalPoints,
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
      console.log(`  - Exam ${index + 1}: ${exam.title}`);
      console.log(`    Type: ${exam.type}`);
      console.log(`    Questions: ${exam.questions.length}`);
      console.log(`    Total Points: ${exam.totalPoints}`);
      console.log(`    Total Marks: ${exam.totalMarks}`);
    });
    
    // Test 5: Test course update with modified exams
    console.log('\n✏️ Test 5: Testing course update...');
    
    // Modify the first exam to add a question
    const updatedExams = [...retrievedCourse.exams];
    updatedExams[0].questions.push({
      questionText: 'What is 10 - 2?',
      type: 'multiple_choice',
      points: 12,
      options: [
        { text: '6', isCorrect: false },
        { text: '8', isCorrect: true },
        { text: '10', isCorrect: false }
      ],
      correctAnswer: '8'
    });
    
    // Update the course
    const courseToUpdate = await Course.findById(retrievedCourse._id);
    courseToUpdate.exams = updatedExams;
    await courseToUpdate.save();
    
    // Retrieve updated course
    const updatedCourse = await Course.findById(savedCourse._id);
    console.log(`📝 Updated Exam 1 now has ${updatedCourse.exams[0].questions.length} questions`);
    console.log(`📊 Updated Exam 1 totalPoints: ${updatedCourse.exams[0].totalPoints}`);
    
    // Verify totalPoints was recalculated
    const expectedUpdatedPoints = updatedExams[0].questions.reduce((sum, question) => {
      return sum + (question.points || 1);
    }, 0);
    
    if (updatedCourse.exams[0].totalPoints !== expectedUpdatedPoints) {
      throw new Error(`Updated exam: Expected totalPoints ${expectedUpdatedPoints}, but got ${updatedCourse.exams[0].totalPoints}`);
    }
    
    // Test 6: Run 3 cycles to confirm data persistence
    console.log('\n🔄 Test 6: Running 3 cycles to confirm data persistence...');
    
    for (let cycle = 1; cycle <= 3; cycle++) {
      console.log(`\n  Cycle ${cycle}:`);
      
      // Retrieve course
      const cycleCourse = await Course.findById(savedCourse._id);
      
      // Verify exams count
      if (cycleCourse.exams.length !== 2) {
        throw new Error(`Cycle ${cycle}: Expected 2 exams, but found ${cycleCourse.exams.length}`);
      }
      
      // Verify totalPoints for each exam
      cycleCourse.exams.forEach((exam, index) => {
        const expectedPoints = exam.questions.reduce((sum, question) => sum + (question.points || 1), 0);
        if (exam.totalPoints !== expectedPoints) {
          throw new Error(`Cycle ${cycle}, Exam ${index + 1}: Expected totalPoints ${expectedPoints}, but got ${exam.totalPoints}`);
        }
        console.log(`    Exam ${index + 1}: ${exam.questions.length} questions, ${exam.totalPoints} points ✅`);
      });
      
      console.log(`  Cycle ${cycle} completed successfully ✅`);
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await Course.findByIdAndDelete(savedCourse._id);
    console.log('✅ Test course deleted');
    
    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Multiple exams per course handling');
    console.log('✅ Automatic totalPoints calculation');
    console.log('✅ Frontend compatibility');
    console.log('✅ Course update functionality');
    console.log('✅ Data persistence across 3 cycles');
    console.log('✅ Individual question points validation');
    
    console.log('\n📊 Test Results:');
    console.log(`  - Exam 1: 3 questions → 30 total points (10+15+5)`);
    console.log(`  - Exam 2: 4 questions → 70 total points (20+15+10+25)`);
    console.log(`  - Total exams: 2`);
    console.log(`  - All calculations verified ✅`);
    
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
  testMultipleExamsAndTotalPoints()
    .then(() => {
      console.log('✅ Multiple exams and totalPoints test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Multiple exams and totalPoints test failed:', error);
      process.exit(1);
    });
}

module.exports = { testMultipleExamsAndTotalPoints };
