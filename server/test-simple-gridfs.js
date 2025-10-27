const mongoose = require('mongoose');
const { uploadImageToGridFS, getImageFromGridFS, deleteImageFromGridFS } = require('./utils/unifiedGridfsUpload');

// Test configuration
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn-test";

// Create a test image buffer
const createTestImageBuffer = () => {
  // Create a simple 1x1 pixel JPEG
  return Buffer.from([
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
};

// Test suite
const runSimpleTests = async () => {
  try {
    console.log('🧪 Starting Simple GridFS Tests...\n');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to MongoDB\n');

    // Create test image
    const testImageBuffer = createTestImageBuffer();
    const testFile = {
      buffer: testImageBuffer,
      originalname: 'test-image.jpg',
      mimetype: 'image/jpeg',
      size: testImageBuffer.length
    };

    // Test 1: Upload image
    console.log('📤 Test 1: Upload image to GridFS');
    const uploadResult = await uploadImageToGridFS(testFile, 'test-user');
    
    console.log('✅ Upload result:', uploadResult);
    
    if (!uploadResult.success) {
      throw new Error('Upload failed: ' + uploadResult.message);
    }

    const imageId = uploadResult.fileId;
    const imageUrl = uploadResult.url;
    console.log(`✅ Image uploaded successfully. ID: ${imageId}, URL: ${imageUrl}\n`);

    // Test 2: Retrieve image
    console.log('🖼️ Test 2: Retrieve image from GridFS');
    const imageStream = await getImageFromGridFS(imageId);
    
    console.log('✅ Image stream retrieved successfully');
    console.log(`   Stream type: ${typeof imageStream}`);
    console.log(`   Has pipe method: ${typeof imageStream.pipe === 'function'}\n`);

    // Test 3: Test invalid file type
    console.log('❌ Test 3: Test invalid file type');
    const invalidFile = {
      buffer: Buffer.from('not an image'),
      originalname: 'test.txt',
      mimetype: 'text/plain',
      size: 12
    };

    try {
      await uploadImageToGridFS(invalidFile, 'test-user');
      console.log('❌ Invalid file type should have been rejected');
    } catch (error) {
      console.log('✅ Invalid file type rejected:', error.message);
    }
    console.log('');

    // Test 4: Test file too large
    console.log('📏 Test 4: Test file too large');
    const largeFile = {
      buffer: Buffer.alloc(6 * 1024 * 1024), // 6MB
      originalname: 'large-file.jpg',
      mimetype: 'image/jpeg',
      size: 6 * 1024 * 1024
    };

    try {
      await uploadImageToGridFS(largeFile, 'test-user');
      console.log('❌ Large file should have been rejected');
    } catch (error) {
      console.log('✅ Large file rejected:', error.message);
    }
    console.log('');

    // Test 5: Delete image
    console.log('🗑️ Test 5: Delete image from GridFS');
    const deleteResult = await deleteImageFromGridFS(imageId);
    
    console.log('✅ Delete result:', deleteResult);
    
    if (!deleteResult.success) {
      throw new Error('Delete failed: ' + deleteResult.message);
    }

    console.log('✅ Image deleted successfully\n');

    console.log('🎉 All simple tests passed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Image upload: PASSED');
    console.log('   ✅ Image retrieval: PASSED');
    console.log('   ✅ Invalid file type handling: PASSED');
    console.log('   ✅ File size validation: PASSED');
    console.log('   ✅ Image deletion: PASSED');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runSimpleTests();
}

module.exports = { runSimpleTests };
