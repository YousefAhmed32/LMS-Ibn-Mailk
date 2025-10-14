const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/test');

// Import the Notification model
const Notification = require('./models/Notification');

async function createTestNotification() {
  try {
    console.log('🧪 Creating test notification...');
    
    const testUserId = '68b654bd37bcf19712729591';
    
    const notification = await Notification.create({
      userId: testUserId,
      type: 'general',
      title: 'إشعار تجريبي',
      message: 'هذا إشعار تجريبي للتأكد من عمل النظام',
      category: 'system',
      priority: 'medium'
    });
    
    console.log('✅ Test notification created:', notification._id);
    
    // Test fetching notifications
    const result = await Notification.getUserNotifications(testUserId, {
      page: 1,
      limit: 10
    });
    
    console.log('📋 Current notifications:', result.notifications.length);
    console.log('🔢 Unread count:', await Notification.getUnreadCount(testUserId));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

createTestNotification();
