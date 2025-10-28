// Test script to verify all routes are properly loaded
const express = require('express');
const app = express();

// Import all route modules
const authRoutes = require('./routers/auth-routes');
const courseRoutes = require('./routers/course-routes');
const adminRoutes = require('./routers/admin-routes');
const paymentRoutes = require('./routers/payment-routes');
const adminPaymentRoutes = require('./routers/admin-payment-routes');
const notificationRoutes = require('./routers/notification-routes');
const youtubeVideoRoutes = require('./routers/youtube-video-routes');
const videoRoutes = require('./routers/video-routes');
const progressRoutes = require('./routes/progress');
const userProgressRoutes = require('./routes/progressRoutes');
const examRoutes = require('./routes/exam');
const examsRoutes = require('./routes/exams');
const internalExamRoutes = require('./routes/internalExamRoutes');
const examRoutesNew = require('./routers/exam-routes');
const examResultRoutes = require('./routers/examResultRoutes');
const groupRoutes = require('./routers/group-routes');
const unifiedUploadRoutes = require('./routers/unified-upload-routes');
const userDashboardRoutes = require('./routers/user-dashboard-routes');
const parentRoutes = require('./routers/parent-routes');
const enhancedParentRoutes = require('./routes/enhanced-parent-routes');
const debugRoutes = require('./routes/debug-routes');
const adminDashboardRoutes = require('./routes/admin-dashboard-routes');
const uploadRoutes = require('./routes/upload');
const uploadRoutesOld = require('./routers/upload-routes');

// Mount all routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminDashboardRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/youtube", youtubeVideoRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/user-progress", userProgressRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/exams", examRoutesNew);
app.use("/api/exams-old", examsRoutes);
app.use("/api/internal-exams", internalExamRoutes);
app.use("/api/exam-results", examResultRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/upload", unifiedUploadRoutes);
app.use("/api/uploads", unifiedUploadRoutes);
app.use("/api/user", userDashboardRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/parent-enhanced", enhancedParentRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/upload-old", uploadRoutes);
app.use("/api/files", uploadRoutesOld);

// Test specific route
app.get("/test-auth-me", (req, res) => {
  console.log('🔍 Testing /api/auth/me route...');
  
  // Check if auth routes are properly mounted
  const authRouter = app._router.stack.find(middleware => 
    middleware.regexp && middleware.regexp.source.includes('auth')
  );
  
  if (authRouter) {
    console.log('✅ Auth routes are mounted');
    res.json({
      success: true,
      message: 'Auth routes are properly mounted',
      authRouteFound: true
    });
  } else {
    console.log('❌ Auth routes not found');
    res.json({
      success: false,
      message: 'Auth routes not found',
      authRouteFound: false
    });
  }
});

// Get all routes
app.get("/all-routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      if (middleware.regexp) {
        const basePath = middleware.regexp.source.replace(/\\\//g, '/').replace(/\^|\$|\?/g, '');
        routes.push({
          path: basePath,
          methods: ['*'],
          type: 'router'
        });
      }
    }
  });
  
  res.json({
    success: true,
    totalRoutes: routes.length,
    routes: routes.sort((a, b) => a.path.localeCompare(b.path))
  });
});

console.log('🚀 Starting route test server...');
const server = app.listen(3001, () => {
  console.log('✅ Test server running on port 3001');
  console.log('📋 Available test endpoints:');
  console.log('  - GET /test-auth-me - Test auth routes');
  console.log('  - GET /all-routes - List all routes');
});

// Auto-test after 1 second
setTimeout(() => {
  console.log('\n🔍 Running automatic tests...');
  
  // Test auth routes
  const authRouter = app._router.stack.find(middleware => 
    middleware.regexp && middleware.regexp.source.includes('auth')
  );
  
  if (authRouter) {
    console.log('✅ Auth routes: MOUNTED');
  } else {
    console.log('❌ Auth routes: NOT MOUNTED');
  }
  
  // Count total routes
  const routeCount = app._router.stack.filter(middleware => 
    middleware.route || (middleware.name === 'router' && middleware.regexp)
  ).length;
  
  console.log(`📊 Total mounted routes: ${routeCount}`);
  
  // Close server
  server.close();
  console.log('✅ Tests completed');
}, 1000);