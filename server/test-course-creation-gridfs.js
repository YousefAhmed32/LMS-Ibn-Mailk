const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import the course creation controller and routes
const createCourse = require('./controllers/admin-controller/createCourse');
const unifiedUploadRoutes = require('./routers/unified-upload-routes');

// Create test app
const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Mock authentication middleware for testing
app.use((req, res, next) => {
  req.user = { _id: new mongoose.Types.ObjectId() };
  next();
});

// Add routes
app.use('/api/upload', unifiedUploadRoutes);
app.use('/api/uploads', unifiedUploadRoutes);
app.post('/api/admin/courses', createCourse);

// Test configuration
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn-test";

// Test data
const testImagePath = path.join(__dirname, 'test-course-image.jpg');

// Create a test image file if it doesn't exist
const createTestImage = () => {
  if (!fs.existsSync(testImagePath)) {
    // Create a simple 1x1 pixel JPEG
    const jpegData = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x2A, 0xFF, 0xD9
    ]);
    fs.writeFileSync(testImagePath, jpegData);
    console.log('✅ Created test course image file');
  }
};

// Test suite
const runCourseCreationTests = async () => {
  try {
    console.log('🧪 Starting Course Creation with GridFS Tests...\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    // Create test image
    createTestImage();

    // Test 1: Upload image first
    console.log('📤 Test 1: Upload course image');
    const uploadResponse = await request(app)
      .post('/api/upload/image')
      .attach('image', testImagePath)
      .expect(200);

    console.log('✅ Image upload response:', uploadResponse.body);
    
    if (!uploadResponse.body.success) {
      throw new Error('Image upload failed: ' + uploadResponse.body.message);
    }

    const imageId = uploadResponse.body.data.id;
    const imageUrl = uploadResponse.body.data.url;
    console.log(`✅ Image uploaded successfully. ID: ${imageId}, URL: ${imageUrl}\n`);

    // Test 2: Create course with image URL
    console.log('📚 Test 2: Create course with image URL');
    const courseData = {
      title: 'Test Mathematics Course',
      description: 'A comprehensive test course for mathematics',
      subject: 'mathematics',
      grade: '7',
      price: 150,
      duration: 20,
      level: 'beginner',
      imageUrl: imageUrl,
      videos: JSON.stringify([
        {
          title: 'Introduction to Algebra',
          url: 'https://www.youtube.com/watch?v=test1',
          duration: 15,
          order: 0
        },
        {
          title: 'Basic Equations',
          url: 'https://www.youtube.com/watch?v=test2',
          duration: 20,
          order: 1
        }
      ]),
      exams: JSON.stringify([
        {
          title: 'Algebra Quiz',
          type: 'internal_exam',
          duration: 30,
          passingScore: 70,
          questions: [
            {
              questionText: 'What is 2 + 2?',
              type: 'mcq',
              points: 1,
              options: [
                { text: '3', isCorrect: false },
                { text: '4', isCorrect: true },
                { text: '5', isCorrect: false }
              ],
              correctAnswer: 1
            }
          ]
        }
      ])
    };

    const courseResponse = await request(app)
      .post('/api/admin/courses')
      .send(courseData)
      .expect(200);

    console.log('✅ Course creation response:', courseResponse.body);
    
    if (!courseResponse.body.success) {
      throw new Error('Course creation failed: ' + courseResponse.body.message);
    }

    const course = courseResponse.body.data;
    console.log(`✅ Course created successfully. ID: ${course._id}`);
    console.log(`   Title: ${course.title}`);
    console.log(`   Image URL: ${course.imageUrl}`);
    console.log(`   Videos: ${course.videos.length}`);
    console.log(`   Exams: ${course.exams.length}\n`);

    // Test 3: Verify image is accessible
    console.log('🖼️ Test 3: Verify course image is accessible');
    const imageResponse = await request(app)
      .get(`/api/uploads/${imageId}`)
      .expect(200);

    console.log('✅ Course image is accessible');
    console.log(`   Content-Type: ${imageResponse.headers['content-type']}`);
    console.log(`   Content-Length: ${imageResponse.headers['content-length']}\n`);

    // Test 4: Create course with direct file upload
    console.log('📚 Test 4: Create course with direct file upload');
    const courseWithFileData = {
      title: 'Test Physics Course',
      description: 'A test course for physics with direct file upload',
      subject: 'physics',
      grade: '8',
      price: 200,
      duration: 25,
      level: 'intermediate',
      videos: JSON.stringify([]),
      exams: JSON.stringify([])
    };

    const courseWithFileResponse = await request(app)
      .post('/api/admin/courses')
      .field('title', courseWithFileData.title)
      .field('description', courseWithFileData.description)
      .field('subject', courseWithFileData.subject)
      .field('grade', courseWithFileData.grade)
      .field('price', courseWithFileData.price)
      .field('duration', courseWithFileData.duration)
      .field('level', courseWithFileData.level)
      .field('videos', courseWithFileData.videos)
      .field('exams', courseWithFileData.exams)
      .attach('image', testImagePath)
      .expect(200);

    console.log('✅ Course with file upload response:', courseWithFileResponse.body);
    
    if (!courseWithFileResponse.body.success) {
      throw new Error('Course with file upload failed: ' + courseWithFileResponse.body.message);
    }

    const courseWithFile = courseWithFileResponse.body.data;
    console.log(`✅ Course with file upload created successfully. ID: ${courseWithFile._id}`);
    console.log(`   Title: ${courseWithFile.title}`);
    console.log(`   Image URL: ${courseWithFile.imageUrl}\n`);

    // Test 5: Test validation errors
    console.log('❌ Test 5: Test course validation errors');
    const invalidCourseData = {
      title: '', // Empty title should fail
      subject: 'mathematics',
      grade: '7',
      price: -10, // Negative price should fail
      duration: 20,
      level: 'beginner'
    };

    const validationResponse = await request(app)
      .post('/api/admin/courses')
      .send(invalidCourseData)
      .expect(400);

    console.log('✅ Validation errors handled correctly:', validationResponse.body.message);
    console.log(`   Errors: ${validationResponse.body.errors.length} validation errors\n`);

    console.log('🎉 All course creation tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Image upload: PASSED');
    console.log('   ✅ Course creation with image URL: PASSED');
    console.log('   ✅ Course creation with file upload: PASSED');
    console.log('   ✅ Image accessibility: PASSED');
    console.log('   ✅ Validation error handling: PASSED');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('\n🧹 Cleaned up test image file');
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runCourseCreationTests();
}

module.exports = { runCourseCreationTests };
