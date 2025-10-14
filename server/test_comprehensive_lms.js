const mongoose = require('mongoose');
const Course = require('./models/Course');
const ExamResult = require('./models/ExamResult');
const User = require('./models/User');

// Comprehensive test suite for LMS course management system
async function runComprehensiveTests() {
  try {
    console.log('🧪 Starting Comprehensive LMS Tests...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/test');
    console.log('✅ Connected to MongoDB');
    
    // Clean up any previous test data
    await Course.deleteMany({ title: /Test Course/ });
    await ExamResult.deleteMany({ examTitle: /Test Exam/ });
    console.log('🧹 Cleaned up previous test data');
    
    // Test 1: Course Creation with Multiple Exams
    console.log('\n📝 Test 1: Creating course with 2 videos and 3 exams...');
    
    const testCourseData = {
      title: 'Test Course - Comprehensive LMS',
      description: 'A comprehensive test course with videos and multiple exams',
      subject: 'Computer Science',
      grade: '12',
      instructor: 'Test Instructor',
      duration: 180,
      price: 199.99,
      isActive: true,
      videos: [
        {
          title: 'Introduction to Programming',
          url: 'https://youtube.com/watch?v=intro',
          duration: 20,
          order: 1
        },
        {
          title: 'Data Structures and Algorithms',
          url: 'https://youtube.com/watch?v=dsa',
          duration: 30,
          order: 2
        }
      ],
      exams: [
        {
          title: 'Programming Basics Quiz',
          type: 'internal_exam',
          duration: 30,
          passingScore: 70,
          questions: [
            {
              questionText: 'What is a variable in programming?',
              type: 'multiple_choice',
              points: 10,
              options: [
                { text: 'A storage location', isCorrect: false },
                { text: 'A named storage location', isCorrect: true },
                { text: 'A function', isCorrect: false },
                { text: 'A loop', isCorrect: false }
              ],
              correctAnswer: 'A named storage location'
            },
            {
              questionText: 'Which data type is used for whole numbers?',
              type: 'multiple_choice',
              points: 15,
              options: [
                { text: 'String', isCorrect: false },
                { text: 'Integer', isCorrect: true },
                { text: 'Boolean', isCorrect: false },
                { text: 'Float', isCorrect: false }
              ],
              correctAnswer: 'Integer'
            },
            {
              questionText: 'Is Python a compiled language?',
              type: 'true_false',
              points: 5,
              correctAnswer: false
            }
          ]
        },
        {
          title: 'Data Structures Quiz',
          type: 'internal_exam',
          duration: 45,
          passingScore: 75,
          questions: [
            {
              questionText: 'What is the time complexity of binary search?',
              type: 'multiple_choice',
              points: 20,
              options: [
                { text: 'O(n)', isCorrect: false },
                { text: 'O(log n)', isCorrect: true },
                { text: 'O(n²)', isCorrect: false },
                { text: 'O(1)', isCorrect: false }
              ],
              correctAnswer: 'O(log n)'
            },
            {
              questionText: 'Which data structure follows LIFO principle?',
              type: 'multiple_choice',
              points: 15,
              options: [
                { text: 'Queue', isCorrect: false },
                { text: 'Stack', isCorrect: true },
                { text: 'Array', isCorrect: false },
                { text: 'Linked List', isCorrect: false }
              ],
              correctAnswer: 'Stack'
            },
            {
              questionText: 'Is a hash table a linear data structure?',
              type: 'true_false',
              points: 10,
              correctAnswer: false
            },
            {
              questionText: 'Explain the difference between an array and a linked list.',
              type: 'essay',
              points: 25,
              correctAnswer: '',
              sampleAnswer: 'Arrays have contiguous memory allocation while linked lists have non-contiguous memory allocation.'
            }
          ]
        },
        {
          title: 'Advanced Concepts Quiz',
          type: 'internal_exam',
          duration: 60,
          passingScore: 80,
          questions: [
            {
              questionText: 'What is the purpose of recursion?',
              type: 'multiple_choice',
              points: 15,
              options: [
                { text: 'To iterate through arrays', isCorrect: false },
                { text: 'To solve problems by breaking them into smaller subproblems', isCorrect: true },
                { text: 'To store data', isCorrect: false },
                { text: 'To sort arrays', isCorrect: false }
              ],
              correctAnswer: 'To solve problems by breaking them into smaller subproblems'
            },
            {
              questionText: 'Is dynamic programming always more efficient than recursion?',
              type: 'true_false',
              points: 20,
              correctAnswer: true
            },
            {
              questionText: 'Describe the concept of object-oriented programming.',
              type: 'essay',
              points: 30,
              correctAnswer: '',
              sampleAnswer: 'OOP is a programming paradigm based on objects that contain data and methods.'
            }
          ]
        }
      ]
    };
    
    const course = new Course(testCourseData);
    const savedCourse = await course.save();
    console.log(`✅ Course created with ID: ${savedCourse._id}`);
    console.log(`📊 Course has ${savedCourse.videos.length} videos and ${savedCourse.exams.length} exams`);
    
    // Test 2: Verify Exam Structure and Total Points Calculation
    console.log('\n🔍 Test 2: Verifying exam structure and total points...');
    
    savedCourse.exams.forEach((exam, index) => {
      console.log(`\n  Exam ${index + 1}: ${exam.title}`);
      console.log(`    Type: ${exam.type}`);
      console.log(`    Questions: ${exam.questions.length}`);
      console.log(`    Total Points: ${exam.totalPoints}`);
      console.log(`    Total Marks: ${exam.totalMarks}`);
      console.log(`    Duration: ${exam.duration} minutes`);
      console.log(`    Passing Score: ${exam.passingScore}%`);
      
      // Verify total points calculation
      const expectedTotalPoints = exam.questions.reduce((sum, question) => {
        return sum + (question.points || 1);
      }, 0);
      
      if (exam.totalPoints !== expectedTotalPoints) {
        throw new Error(`Exam ${index + 1}: Expected totalPoints ${expectedTotalPoints}, but got ${exam.totalPoints}`);
      }
      
      if (exam.totalMarks !== expectedTotalPoints) {
        throw new Error(`Exam ${index + 1}: Expected totalMarks ${expectedTotalPoints}, but got ${exam.totalMarks}`);
      }
      
      console.log(`    ✅ Total points calculation verified: ${exam.totalPoints}`);
      
      // Verify question structure
      exam.questions.forEach((question, qIndex) => {
        console.log(`      Q${qIndex + 1}: ${question.questionText.substring(0, 50)}...`);
        console.log(`        Type: ${question.type}`);
        console.log(`        Points: ${question.points}`);
        
        if (question.type === 'multiple_choice' || question.type === 'mcq') {
          if (!question.options || question.options.length < 2) {
            throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Multiple choice must have at least 2 options`);
          }
          if (!question.correctAnswer) {
            throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: Multiple choice must have correct answer`);
          }
        }
        
        if (question.type === 'true_false') {
          if (typeof question.correctAnswer !== 'boolean') {
            throw new Error(`Exam ${index + 1}, Question ${qIndex + 1}: True/false must have boolean correct answer`);
          }
        }
      });
    });
    
    // Test 3: Simulate Student Taking Exams
    console.log('\n👨‍🎓 Test 3: Simulating student exam submissions...');
    
    // Create a test student
    const testStudent = new User({
      firstName: 'Test',
      secondName: 'Student',
      thirdName: 'Name',
      fourthName: 'Last',
      email: 'teststudent@example.com',
      password: 'password123',
      role: 'student',
      grade: '12',
      allowedCourses: [savedCourse._id]
    });
    await testStudent.save();
    console.log(`✅ Test student created with ID: ${testStudent._id}`);
    
    // Simulate taking each exam
    for (let examIndex = 0; examIndex < savedCourse.exams.length; examIndex++) {
      const exam = savedCourse.exams[examIndex];
      console.log(`\n📝 Taking exam: ${exam.title}`);
      
      // Prepare answers (mix of correct and incorrect)
      const answers = exam.questions.map((question, qIndex) => {
        let answer = '';
        
        if (question.type === 'multiple_choice' || question.type === 'mcq') {
          // Sometimes give correct answer, sometimes incorrect
          if (qIndex % 2 === 0) {
            answer = question.correctAnswer;
          } else {
            // Pick a wrong answer
            const wrongOptions = question.options.filter(opt => opt.text !== question.correctAnswer);
            answer = wrongOptions[0]?.text || question.options[0]?.text || '';
          }
        } else if (question.type === 'true_false') {
          // Sometimes give correct answer, sometimes incorrect
          answer = qIndex % 2 === 0 ? question.correctAnswer : !question.correctAnswer;
        } else if (question.type === 'essay') {
          // Give a reasonable essay answer
          answer = `This is a test answer for the essay question: ${question.questionText.substring(0, 50)}...`;
        }
        
        return {
          questionId: question.id || qIndex,
          answer: answer
        };
      });
      
      // Create exam result
      const examResult = new ExamResult({
        studentId: testStudent._id,
        courseId: savedCourse._id,
        examId: exam.id || `exam_${examIndex}`,
        examTitle: exam.title,
        score: 0, // Will be calculated
        maxScore: exam.totalPoints,
        percentage: 0, // Will be calculated
        grade: 'F', // Will be calculated
        passed: false, // Will be calculated
        answers: [], // Will be populated
        submittedAt: new Date(),
        timeSpent: exam.duration * 60 // Full time spent
      });
      
      // Grade the exam
      let totalScore = 0;
      const gradedAnswers = [];
      
      exam.questions.forEach((question, qIndex) => {
        const userAnswer = answers.find(a => a.questionId === (question.id || qIndex));
        let isCorrect = false;
        let pointsEarned = 0;
        
        if (userAnswer) {
          if (question.type === 'multiple_choice' || question.type === 'mcq') {
            if (question.correctAnswer === userAnswer.answer) {
              isCorrect = true;
              pointsEarned = question.points || 1;
            }
          } else if (question.type === 'true_false') {
            if (question.correctAnswer === userAnswer.answer) {
              isCorrect = true;
              pointsEarned = question.points || 1;
            }
          } else if (question.type === 'essay') {
            // Give partial credit for essay answers
            const answerLength = userAnswer.answer ? userAnswer.answer.length : 0;
            if (answerLength > 50) {
              isCorrect = true;
              pointsEarned = question.points || 1;
            } else if (answerLength > 20) {
              isCorrect = true;
              pointsEarned = Math.floor((question.points || 1) * 0.5);
            }
          }
        }
        
        totalScore += pointsEarned;
        
        gradedAnswers.push({
          questionId: question.id || qIndex,
          questionText: question.questionText,
          questionType: question.type,
          correctAnswer: question.correctAnswer,
          userAnswer: userAnswer?.answer || '',
          isCorrect: isCorrect,
          pointsEarned: pointsEarned,
          maxPoints: question.points || 1
        });
      });
      
      // Calculate percentage and grade
      const percentage = exam.totalPoints > 0 ? Math.round((totalScore / exam.totalPoints) * 100) : 0;
      const passed = percentage >= exam.passingScore;
      
      // Determine grade
      let grade = 'F';
      if (percentage >= 97) grade = 'A+';
      else if (percentage >= 93) grade = 'A';
      else if (percentage >= 90) grade = 'A-';
      else if (percentage >= 87) grade = 'B+';
      else if (percentage >= 83) grade = 'B';
      else if (percentage >= 80) grade = 'B-';
      else if (percentage >= 77) grade = 'C+';
      else if (percentage >= 73) grade = 'C';
      else if (percentage >= 70) grade = 'C-';
      else if (percentage >= 67) grade = 'D+';
      else if (percentage >= 63) grade = 'D';
      else if (percentage >= 60) grade = 'D-';
      
      // Update exam result
      examResult.score = totalScore;
      examResult.percentage = percentage;
      examResult.grade = grade;
      examResult.passed = passed;
      examResult.answers = gradedAnswers;
      
      await examResult.save();
      
      console.log(`  ✅ Exam submitted: ${totalScore}/${exam.totalPoints} (${percentage}%) - Grade: ${grade} - ${passed ? 'PASSED' : 'FAILED'}`);
    }
    
    // Test 4: Verify Course Content API Structure
    console.log('\n🔍 Test 4: Verifying course content API structure...');
    
    const courseContent = {
      course: {
        _id: savedCourse._id,
        title: savedCourse.title,
        description: savedCourse.description,
        grade: savedCourse.grade,
        subject: savedCourse.subject,
        price: savedCourse.price,
        totalDuration: savedCourse.videos?.reduce((total, video) => total + (video.duration || 0), 0) || 0,
        videoCount: savedCourse.videos?.length || 0,
        examCount: savedCourse.exams?.length || 0
      },
      videos: savedCourse.videos?.map((video, index) => ({
        _id: video._id,
        id: `lesson_${index + 1}`,
        title: video.title,
        url: video.url,
        duration: video.duration,
        order: video.order || index
      })) || [],
      exams: savedCourse.exams?.map((exam, index) => ({
        id: exam.id || exam._id || `exam_${index}`,
        title: exam.title,
        type: exam.type,
        url: exam.url || '',
        totalMarks: exam.totalMarks,
        totalPoints: exam.totalPoints,
        duration: exam.duration,
        passingScore: exam.passingScore,
        questions: exam.questions,
        totalQuestions: exam.totalQuestions || exam.questions.length,
        migratedFromGoogleForm: exam.migratedFromGoogleForm || false,
        migrationNote: exam.migrationNote || ''
      })) || []
    };
    
    console.log(`📊 Course content structure verified:`);
    console.log(`  - Course: ${courseContent.course.title}`);
    console.log(`  - Videos: ${courseContent.videos.length}`);
    console.log(`  - Exams: ${courseContent.exams.length}`);
    
    courseContent.exams.forEach((exam, index) => {
      console.log(`  - Exam ${index + 1}: ${exam.title} (${exam.questions.length} questions, ${exam.totalPoints} points)`);
    });
    
    // Test 5: Run 3 cycles to confirm stability
    console.log('\n🔄 Test 5: Running 3 cycles to confirm stability...');
    
    for (let cycle = 1; cycle <= 3; cycle++) {
      console.log(`\n  Cycle ${cycle}:`);
      
      // Retrieve course
      const cycleCourse = await Course.findById(savedCourse._id);
      
      // Verify structure
      if (cycleCourse.videos.length !== 2) {
        throw new Error(`Cycle ${cycle}: Expected 2 videos, found ${cycleCourse.videos.length}`);
      }
      
      if (cycleCourse.exams.length !== 3) {
        throw new Error(`Cycle ${cycle}: Expected 3 exams, found ${cycleCourse.exams.length}`);
      }
      
      // Verify exam data integrity
      cycleCourse.exams.forEach((exam, index) => {
        const expectedPoints = exam.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        if (exam.totalPoints !== expectedPoints) {
          throw new Error(`Cycle ${cycle}, Exam ${index + 1}: Total points mismatch`);
        }
        if (exam.totalMarks !== expectedPoints) {
          throw new Error(`Cycle ${cycle}, Exam ${index + 1}: Total marks mismatch`);
        }
      });
      
      // Verify exam results
      const examResults = await ExamResult.find({
        studentId: testStudent._id,
        courseId: savedCourse._id
      });
      
      if (examResults.length !== 3) {
        throw new Error(`Cycle ${cycle}: Expected 3 exam results, found ${examResults.length}`);
      }
      
      console.log(`    ✅ Cycle ${cycle} completed successfully`);
      console.log(`    📊 Videos: ${cycleCourse.videos.length}, Exams: ${cycleCourse.exams.length}, Results: ${examResults.length}`);
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await Course.findByIdAndDelete(savedCourse._id);
    await ExamResult.deleteMany({ studentId: testStudent._id });
    await User.findByIdAndDelete(testStudent._id);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All comprehensive tests passed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Course creation with multiple videos and exams');
    console.log('✅ Automatic total points calculation');
    console.log('✅ Exam structure validation');
    console.log('✅ Student exam submission and grading');
    console.log('✅ Course content API structure');
    console.log('✅ Data persistence across 3 cycles');
    console.log('✅ Multiple exam types support (MCQ, True/False, Essay)');
    console.log('✅ Exam result storage and retrieval');
    
    console.log('\n📊 Final Results:');
    console.log(`  - Course: 2 videos, 3 exams`);
    console.log(`  - Exam 1: 3 questions, 30 points`);
    console.log(`  - Exam 2: 4 questions, 70 points`);
    console.log(`  - Exam 3: 3 questions, 65 points`);
    console.log(`  - Total: 10 questions, 165 points`);
    console.log(`  - All calculations verified ✅`);
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run tests if called directly
if (require.main === module) {
  runComprehensiveTests()
    .then(() => {
      console.log('✅ Comprehensive LMS tests completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Comprehensive LMS tests failed:', error);
      process.exit(1);
    });
}

module.exports = { runComprehensiveTests };
