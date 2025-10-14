const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/test');

// Import the Notification model
const Notification = require('./models/Notification');

async function testNotificationSystem() {
  try {
    console.log('🧪 Testing notification system...');
    
    // Test getUserNotifications method
    console.log('📋 Testing getUserNotifications...');
    
    // Get a test user ID (you can replace this with a real user ID from your database)
    const testUserId = '68b654bd37bcf19712729591'; // Replace with actual user ID
    
    const result = await Notification.getUserNotifications(testUserId, {
      page: 1,
      limit: 10,
      type: 'all',
      read: 'all',
      category: 'all'
    });
    
    console.log('✅ getUserNotifications result:', {
      notificationsCount: result.notifications.length,
      totalPages: result.pagination.totalPages,
      totalItems: result.pagination.totalItems
    });
    
    // Test getUnreadCount method
    console.log('🔢 Testing getUnreadCount...');
    const unreadCount = await Notification.getUnreadCount(testUserId);
    console.log('✅ Unread count:', unreadCount);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

testNotificationSystem();
