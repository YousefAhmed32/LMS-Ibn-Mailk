const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import the unified upload routes
const unifiedUploadRoutes = require('../routers/unified-upload-routes');

// Create test app
const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/api/upload', unifiedUploadRoutes);
app.use('/api/uploads', unifiedUploadRoutes);

// Mock authentication middleware for testing
app.use((req, res, next) => {
  req.user = { _id: new mongoose.Types.ObjectId() };
  next();
});

// Test configuration
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn-test";

// Test data
const testImagePath = path.join(__dirname, 'test-image.jpg');

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
    console.log('✅ Created test image file');
  }
};

// Test suite
const runTests = async () => {
  try {
    console.log('🧪 Starting GridFS Upload System Tests...\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    // Create test image
    createTestImage();

    // Test 1: Upload single image
    console.log('📤 Test 1: Upload single image');
    const uploadResponse = await request(app)
      .post('/api/upload/image')
      .attach('image', testImagePath)
      .expect(200);

    console.log('✅ Upload response:', uploadResponse.body);
    
    if (!uploadResponse.body.success) {
      throw new Error('Upload failed: ' + uploadResponse.body.message);
    }

    const imageId = uploadResponse.body.data.id;
    const imageUrl = uploadResponse.body.data.url;
    console.log(`✅ Image uploaded successfully. ID: ${imageId}, URL: ${imageUrl}\n`);

    // Test 2: Retrieve uploaded image
    console.log('🖼️ Test 2: Retrieve uploaded image');
    const retrieveResponse = await request(app)
      .get(`/api/uploads/${imageId}`)
      .expect(200);

    console.log('✅ Image retrieved successfully');
    console.log(`   Content-Type: ${retrieveResponse.headers['content-type']}`);
    console.log(`   Content-Length: ${retrieveResponse.headers['content-length']}\n`);

    // Test 3: Test invalid file type
    console.log('❌ Test 3: Test invalid file type');
    const invalidFileResponse = await request(app)
      .post('/api/upload/image')
      .attach('image', Buffer.from('not an image'), 'test.txt')
      .expect(400);

    console.log('✅ Invalid file type rejected:', invalidFileResponse.body.message);
    console.log(`   Error Type: ${invalidFileResponse.body.errorType}\n`);

    // Test 4: Test file too large
    console.log('📏 Test 4: Test file too large');
    const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB
    const largeFileResponse = await request(app)
      .post('/api/upload/image')
      .attach('image', largeFile, 'large-file.jpg')
      .expect(413);

    console.log('✅ Large file rejected:', largeFileResponse.body.message);
    console.log(`   Error Type: ${largeFileResponse.body.errorType}\n`);

    // Test 5: Test invalid image ID
    console.log('🔍 Test 5: Test invalid image ID');
    const invalidIdResponse = await request(app)
      .get('/api/uploads/invalid-id')
      .expect(400);

    console.log('✅ Invalid ID rejected:', invalidIdResponse.body.message);
    console.log(`   Error Type: ${invalidIdResponse.body.errorType}\n`);

    // Test 6: Test non-existent image ID
    console.log('🔍 Test 6: Test non-existent image ID');
    const nonExistentId = new mongoose.Types.ObjectId();
    const nonExistentResponse = await request(app)
      .get(`/api/uploads/${nonExistentId}`)
      .expect(404);

    console.log('✅ Non-existent ID rejected:', nonExistentResponse.body.message);
    console.log(`   Error Type: ${nonExistentResponse.body.errorType}\n`);

    // Test 7: Test course creation with image
    console.log('📚 Test 7: Test course creation with image');
    const courseData = {
      title: 'Test Course',
      description: 'A test course for GridFS integration',
      subject: 'mathematics',
      grade: '7',
      price: 100,
      duration: 10,
      level: 'beginner',
      imageUrl: imageUrl,
      videos: JSON.stringify([]),
      exams: JSON.stringify([])
    };

    // Note: This would require the full course creation endpoint
    console.log('✅ Course data prepared with image URL:', imageUrl);
    console.log('   Note: Full course creation test requires admin authentication\n');

    console.log('🎉 All tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Image upload: PASSED');
    console.log('   ✅ Image retrieval: PASSED');
    console.log('   ✅ Invalid file type handling: PASSED');
    console.log('   ✅ File size validation: PASSED');
    console.log('   ✅ Invalid ID handling: PASSED');
    console.log('   ✅ Non-existent ID handling: PASSED');
    console.log('   ✅ Course data preparation: PASSED');

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
  runTests();
}

module.exports = { runTests };
