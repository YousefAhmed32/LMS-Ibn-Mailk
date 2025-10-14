const mongoose = require('mongoose');
const Course = require('./models/Course');

// Test script to verify totalMarks changes automatically
async function testTotalMarksAutoCalculation() {
  try {
    console.log('🧪 Testing Automatic totalMarks Calculation...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/test');
    console.log('✅ Connected to MongoDB');
    
    // Test data: Course with 2 exams with different total points
    const testCourseData = {
      title: 'Total Marks Auto Test Course',
      description: 'Testing automatic totalMarks calculation',
      subject: 'Mathematics',
      grade: '10',
      instructor: 'Test Instructor',
      duration: 120,
      price: 99.99,
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
          title: 'Math Quiz 1 - 50 Points Total',
          type: 'internal_exam',
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
              questionText: 'What is 6 × 2?',
              type: 'multiple_choice',
              points: 25,
              options: [
                { text: '10', isCorrect: false },
                { text: '12', isCorrect: true },
                { text: '14', isCorrect: false }
              ],
              correctAnswer: '12'
            }
          ]
        },
        {
          title: 'Math Quiz 2 - 38 Points Total',
          type: 'internal_exam',
          duration: 45,
          passingScore: 75,
          questions: [
            {
              questionText: 'What is 7 × 3?',
              type: 'multiple_choice',
              points: 18,
              options: [
                { text: '20', isCorrect: false },
                { text: '21', isCorrect: true },
                { text: '22', isCorrect: false }
              ],
              correctAnswer: '21'
            },
            {
              questionText: 'What is 15 ÷ 3?',
              type: 'multiple_choice',
              points: 20,
              options: [
                { text: '4', isCorrect: false },
                { text: '5', isCorrect: true },
                { text: '6', isCorrect: false }
              ],
              correctAnswer: '5'
            }
          ]
        }
      ]
    };
    
    console.log('\n📝 Creating course with 2 exams...');
    console.log(`  Exam 1: ${testCourseData.exams[0].title} (Expected: 50 points)`);
    console.log(`  Exam 2: ${testCourseData.exams[1].title} (Expected: 38 points)`);
    
    const course = new Course(testCourseData);
    const savedCourse = await course.save();
    console.log(`✅ Course created with ID: ${savedCourse._id}`);
    
    // Verify totalMarks calculation
    console.log('\n🔍 Verifying totalMarks calculation...');
    const retrievedCourse = await Course.findById(savedCourse._id);
    
    retrievedCourse.exams.forEach((exam, index) => {
      console.log(`\n  Exam ${index + 1}: ${exam.title}`);
      console.log(`    Questions: ${exam.questions.length}`);
      console.log(`    Total Points: ${exam.totalPoints}`);
      console.log(`    Total Marks: ${exam.totalMarks}`);
      
      // Calculate expected total
      const expectedTotal = exam.questions.reduce((sum, question) => {
        return sum + (question.points || 1);
      }, 0);
      
      console.log(`    Expected Total: ${expectedTotal}`);
      
      if (exam.totalPoints !== expectedTotal) {
        throw new Error(`Exam ${index + 1}: Expected totalPoints ${expectedTotal}, but got ${exam.totalPoints}`);
      }
      
      if (exam.totalMarks !== expectedTotal) {
        throw new Error(`Exam ${index + 1}: Expected totalMarks ${expectedTotal}, but got ${exam.totalMarks}`);
      }
      
      console.log(`    ✅ Both totalPoints and totalMarks are correct!`);
    });
    
    // Test update scenario
    console.log('\n✏️ Testing update scenario...');
    const courseToUpdate = await Course.findById(retrievedCourse._id);
    
    // Add a question to the first exam (10 + 15 + 25 + 5 = 55)
    courseToUpdate.exams[0].questions.push({
      questionText: 'What is 10 - 5?',
      type: 'multiple_choice',
      points: 5,
      options: [
        { text: '3', isCorrect: false },
        { text: '5', isCorrect: true },
        { text: '7', isCorrect: false }
      ],
      correctAnswer: '5'
    });
    
    await courseToUpdate.save();
    
    const updatedCourse = await Course.findById(savedCourse._id);
    const updatedExam = updatedCourse.exams[0];
    
    console.log(`📝 Updated Exam 1 now has ${updatedExam.questions.length} questions`);
    console.log(`📊 Updated Exam 1 totalPoints: ${updatedExam.totalPoints}`);
    console.log(`📊 Updated Exam 1 totalMarks: ${updatedExam.totalMarks}`);
    
    const expectedUpdatedTotal = 10 + 15 + 25 + 5; // 55
    if (updatedExam.totalPoints !== expectedUpdatedTotal || updatedExam.totalMarks !== expectedUpdatedTotal) {
      throw new Error(`Updated exam: Expected both totalPoints and totalMarks to be ${expectedUpdatedTotal}, but got totalPoints: ${updatedExam.totalPoints}, totalMarks: ${updatedExam.totalMarks}`);
    }
    
    console.log(`✅ Updated exam totalMarks correctly: ${updatedExam.totalMarks}`);
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await Course.findByIdAndDelete(savedCourse._id);
    console.log('✅ Test course deleted');
    
    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ totalMarks automatically equals totalPoints');
    console.log('✅ Exam 1: 50 points → totalMarks = 50');
    console.log('✅ Exam 2: 38 points → totalMarks = 38');
    console.log('✅ Update: 55 points → totalMarks = 55');
    console.log('✅ No more fixed 100 totalMarks!');
    
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
  testTotalMarksAutoCalculation()
    .then(() => {
      console.log('✅ Total marks auto-calculation test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Total marks auto-calculation test failed:', error);
      process.exit(1);
    });
}

module.exports = { testTotalMarksAutoCalculation };
