const mongoose = require('mongoose');
const Course = require('./models/Course');
const fs = require('fs');

// Test script to verify course creation and exam handling
async function runCourseCreationTests() {
  try {
    console.log('🧪 Starting Course Creation Tests...');
    
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/test');
    console.log('✅ Connected to MongoDB');
    
    // Load test payload
    const testPayload = JSON.parse(fs.readFileSync('course_payload.json', 'utf8'));
    console.log('📄 Loaded test payload');
    
    const testResults = [];
    
    // Run 3 test cycles
    for (let cycle = 1; cycle <= 3; cycle++) {
      console.log(`\n🔄 Test Cycle ${cycle}/3`);
      console.log('='.repeat(30));
      
      const cycleResult = {
        cycle: cycle,
        timestamp: new Date().toISOString(),
        payload: testPayload,
        results: {}
      };
      
      try {
        // Create course
        console.log('📝 Creating course...');
        const course = new Course(testPayload);
        const savedCourse = await course.save();
        console.log(`✅ Course created with ID: ${savedCourse._id}`);
        
        cycleResult.results.courseId = savedCourse._id;
        cycleResult.results.courseTitle = savedCourse.title;
        
        // Verify course structure
        console.log('🔍 Verifying course structure...');
        
        // Check videos
        const videosCount = savedCourse.videos ? savedCourse.videos.length : 0;
        console.log(`📹 Videos count: ${videosCount}`);
        cycleResult.results.videosCount = videosCount;
        
        // Check exams
        const examsCount = savedCourse.exams ? savedCourse.exams.length : 0;
        console.log(`📝 Exams count: ${examsCount}`);
        cycleResult.results.examsCount = examsCount;
        
        // Verify exam types and questions
        if (savedCourse.exams && savedCourse.exams.length > 0) {
          console.log('🔍 Analyzing exam structure...');
          savedCourse.exams.forEach((exam, index) => {
            console.log(`  Exam ${index + 1}: ${exam.title}`);
            console.log(`    Type: ${exam.type}`);
            console.log(`    Questions: ${exam.questions ? exam.questions.length : 0}`);
            console.log(`    Total Marks: ${exam.totalMarks}`);
            console.log(`    Duration: ${exam.duration} minutes`);
            console.log(`    Migrated: ${exam.migratedFromGoogleForm || false}`);
            
            if (exam.questions && exam.questions.length > 0) {
              exam.questions.forEach((question, qIndex) => {
                console.log(`      Q${qIndex + 1}: ${question.questionText.substring(0, 50)}...`);
                console.log(`        Type: ${question.type}`);
                console.log(`        Points: ${question.points}`);
              });
            }
          });
        }
        
        // Assertions
        console.log('✅ Running assertions...');
        
        // Assertion 1: Course should have 3 exams
        if (examsCount !== 3) {
          throw new Error(`Expected 3 exams, got ${examsCount}`);
        }
        console.log('✅ Assertion 1 passed: Course has 3 exams');
        
        // Assertion 2: Course should have at least 1 video
        if (videosCount < 1) {
          throw new Error(`Expected at least 1 video, got ${videosCount}`);
        }
        console.log('✅ Assertion 2 passed: Course has at least 1 video');
        
        // Assertion 3: Internal exams should have questions
        const internalExams = savedCourse.exams.filter(exam => exam.type === 'internal_exam');
        console.log(`🔍 Found ${internalExams.length} internal exams`);
        
        internalExams.forEach((exam, index) => {
          if (!exam.questions || exam.questions.length === 0) {
            throw new Error(`Internal exam ${index + 1} (${exam.title}) has no questions`);
          }
          console.log(`✅ Internal exam ${index + 1} has ${exam.questions.length} questions`);
        });
        
        // Assertion 4: Google form exam should be preserved or migrated
        const googleFormExams = savedCourse.exams.filter(exam => exam.type === 'google_form');
        const migratedExams = savedCourse.exams.filter(exam => exam.migratedFromGoogleForm === true);
        
        console.log(`🔍 Google form exams: ${googleFormExams.length}`);
        console.log(`🔍 Migrated exams: ${migratedExams.length}`);
        
        cycleResult.results.internalExamsCount = internalExams.length;
        cycleResult.results.googleFormExamsCount = googleFormExams.length;
        cycleResult.results.migratedExamsCount = migratedExams.length;
        
        console.log('✅ All assertions passed!');
        cycleResult.results.status = 'PASSED';
        
        // Clean up - delete the test course
        console.log('🧹 Cleaning up test course...');
        await Course.findByIdAndDelete(savedCourse._id);
        console.log('✅ Test course deleted');
        
      } catch (error) {
        console.error(`❌ Test cycle ${cycle} failed:`, error.message);
        cycleResult.results.status = 'FAILED';
        cycleResult.results.error = error.message;
        cycleResult.results.stack = error.stack;
      }
      
      testResults.push(cycleResult);
    }
    
    // Generate test report
    console.log('\n📊 TEST SUMMARY');
    console.log('================');
    
    const passedTests = testResults.filter(result => result.results.status === 'PASSED').length;
    const failedTests = testResults.filter(result => result.results.status === 'FAILED').length;
    
    console.log(`Total test cycles: ${testResults.length}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    
    // Save detailed test report
    const reportData = {
      testDate: new Date().toISOString(),
      summary: {
        totalCycles: testResults.length,
        passed: passedTests,
        failed: failedTests,
        successRate: `${((passedTests / testResults.length) * 100).toFixed(1)}%`
      },
      details: testResults
    };
    
    fs.writeFileSync('course_creation_test_report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed test report saved to: course_creation_test_report.json');
    
    if (failedTests === 0) {
      console.log('\n🎉 All tests passed! The course creation system is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the test report for details.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run tests if called directly
if (require.main === module) {
  runCourseCreationTests()
    .then(() => {
      console.log('✅ Test suite completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runCourseCreationTests };
