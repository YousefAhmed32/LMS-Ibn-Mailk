require("dotenv").config();
const express = require('express');
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Try to load auth routes with explicit path
let authRoutes;
try {
    authRoutes = require("./routers/auth-routes/index");
    console.log('✅ Auth routes loaded successfully');
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
    // Try alternative path
    authRoutes = require("./routers/auth-routes");
}
const courseRoutes = require("./routers/course-routes");
const adminRoutes = require("./routers/admin-routes");
const paymentRoutes = require("./routers/payment-routes");
const adminPaymentRoutes = require("./routers/admin-payment-routes");
const notificationRoutes = require("./routers/notification-routes");
const youtubeVideoRoutes = require("./routers/youtube-video-routes");
const videoRoutes = require("./routers/video-routes");
const progressRoutes = require("./routes/progress");
const userProgressRoutes = require("./routes/progressRoutes");
const examRoutes = require("./routes/exam");
const examsRoutes = require("./routes/exams");
const internalExamRoutes = require("./routes/internalExamRoutes");
const examRoutesNew = require("./routers/exam-routes");
const examResultRoutes = require("./routers/examResultRoutes");
const groupRoutes = require("./routers/group-routes");
const unifiedUploadRoutes = require("./routers/unified-upload-routes");
const userDashboardRoutes = require("./routers/user-dashboard-routes");
const parentRoutes = require("./routers/parent-routes");
const enhancedParentRoutes = require("./routes/enhanced-parent-routes");
const debugRoutes = require("./routes/debug-routes");
const adminDashboardRoutes = require("./routes/admin-dashboard-routes");
const uploadRoutes = require("./routes/upload");
const uploadRoutesOld = require("./routers/upload-routes");

// Security middleware
const { configureCSP, configureSecurityHeaders } = require('./middleware/security');


const app = express();
const PORT = process.env.PORT || 5000;

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn";

// Set JWT secret with fallback
process.env.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error("❌ Critical error: JWT_SECRET is not set");
  process.exit(1);
}

// Log configuration
console.log('🔧 Server Configuration:');
console.log(`   Port: ${PORT}`);
console.log(`   MongoDB: ${MONGO_URL}`);
console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`   GridFS: ✅ Configured for local image storage`);
console.log('');

// Note: File uploads are now handled by GridFS through unified-upload-routes

// Performance middleware
app.use(compression({
    level: 6, // Compression level (1-9, 6 is good balance)
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Use compression for all other requests
        return compression.filter(req, res);
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Security middleware
app.use(configureCSP());
app.use(configureSecurityHeaders());

// Trust proxy - Required for proper handling behind Nginx reverse proxy
app.set('trust proxy', 1);

// NO HTTPS redirect middleware here - Nginx handles HTTP → HTTPS
// Backend should NOT redirect to avoid redirect loops

// CORS Configuration
const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174"
    ];

console.log('🌐 CORS Origins:', corsOrigins);

app.use(cors({
    origin: corsOrigins,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parsing with size limits - زيادة الحدود لحل مشكلة 413
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));


// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware for debugging (only for API routes)
app.use('/api', (req, res, next) => {
    console.log(`📨 ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        origin: req.get('origin'),
        userAgent: req.get('user-agent')?.substring(0, 50),
        path: req.path,
        baseUrl: req.baseUrl,
        url: req.url
    });
    
    // Special logging for auth routes
    if (req.path.includes('auth')) {
        console.log('🔐 Auth route detected:', {
            originalUrl: req.originalUrl,
            path: req.path,
            baseUrl: req.baseUrl,
            method: req.method
        });
    }
    
    next();
});

// Routes with debugging
console.log('📦 Loading routes...');

// Verify auth routes is loaded
if (!authRoutes || typeof authRoutes !== 'function') {
    console.error('❌ CRITICAL: Auth routes failed to load!');
    throw new Error('Auth routes module failed to load');
}

console.log('   ✅ Auth routes loaded, mounting at /api/auth');
app.use("/api/auth", authRoutes);
console.log('   ✅ Auth routes mounted successfully');

// Test route mounting by printing router stack
setTimeout(() => {
    const authRouter = authRoutes;
    console.log('   🔍 Auth router stack length:', authRouter?.stack?.length || 'no stack');
}, 1000);

app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminDashboardRoutes);  // Admin dashboard statistics - mount after main admin routes
app.use("/api/admin/payments", adminPaymentRoutes);  // Mount specific routes before general ones
app.use("/api", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/youtube", youtubeVideoRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/progress", progressRoutes);        // VideoProgress - للمسارات القديمة
app.use("/api/user-progress", userProgressRoutes); // UserCourseProgress - للمسارات الجديدة
app.use("/api/exam", examRoutes);
app.use("/api/exams", examRoutesNew); // Use the new exam routes for /api/exams
app.use("/api/exams-old", examsRoutes); // Keep old routes for backward compatibility
app.use("/api/internal-exams", internalExamRoutes);
app.use("/api/exam-results", examResultRoutes);
app.use("/api/groups", groupRoutes);
// Debug middleware for image requests
app.use('/api/image/:id', (req, res, next) => {
  console.log('🖼️ GridFS image request:', {
    id: req.params.id,
    method: req.method,
    url: req.originalUrl
  });
  next();
});

// Upload routes - use unified GridFS system
app.use("/api/upload", unifiedUploadRoutes);
app.use("/api/uploads", unifiedUploadRoutes);
app.use("/api/user", userDashboardRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/parent-enhanced", enhancedParentRoutes);
app.use("/api/debug", debugRoutes);

// Additional upload routes
app.use("/api/upload-old", uploadRoutes);
app.use("/api/files", uploadRoutesOld);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler - must be after all routes but before error handler
app.use("*", (req, res) => {
    // Don't log 404 for static assets or socket.io
    if (!req.originalUrl.startsWith('/socket.io') && !req.originalUrl.startsWith('/uploads')) {
        console.log(`⚠️ 404 - Route not found: ${req.method} ${req.originalUrl}`);
        console.log(`   📍 Request details:`, {
            originalUrl: req.originalUrl,
            baseUrl: req.baseUrl,
            path: req.path,
            url: req.url,
            method: req.method
        });
    }
    res.status(404).json({
        success: false,
        error: "Route not found",
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler - must be last
app.use(errorHandler);

// Routes debug endpoint
app.get("/api/routes", (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            // Handle mounted routers
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

// Database connection
mongoose.connect(MONGO_URL)
.then(() => {
    console.log(`✔️  MongoDB is connected to ${MONGO_URL}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Collections: ${Object.keys(mongoose.connection.collections).length}`);
})
.catch((e) => {
  console.log("❌ MongoDB connection error:", e.message);
  console.log("💡 Make sure MongoDB is running on your system");
  console.log("💡 You can install MongoDB from: https://docs.mongodb.com/manual/installation/");
  console.log("💡 Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas");
});

// Import centralized error handler
const errorHandler = require('./middleware/errorHandler');

// Create HTTP server
const server = http.createServer(app);

// Import production config
const productionConfig = require('./config/production');

// Configure Socket.IO with production-ready settings
const io = new Server(server, productionConfig.socket);

// Store io instance in app for use in controllers
app.set('io', io);

// Set global io instance for notification service
global.io = io;

// Socket.IO connection handling with error handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Handle user joining their room
  socket.on('join', (userId) => {
    try {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined room: user_${userId}`);
      }
    } catch (error) {
      console.error(`❌ Error joining room for user ${userId}:`, error.message);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle joining group chat room
  socket.on('join-group', (groupId) => {
    try {
      if (groupId) {
        socket.join(`group_${groupId}`);
        console.log(`👥 User ${socket.id} joined group room: group_${groupId}`);
      }
    } catch (error) {
      console.error(`❌ Error joining group ${groupId}:`, error.message);
      socket.emit('error', { message: 'Failed to join group' });
    }
  });

  // Handle leaving group chat room
  socket.on('leave-group', (groupId) => {
    try {
      if (groupId) {
        socket.leave(`group_${groupId}`);
        console.log(`👥 User ${socket.id} left group room: group_${groupId}`);
      }
    } catch (error) {
      console.error(`❌ Error leaving group ${groupId}:`, error.message);
    }
  });

  // Handle errors on socket
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`🔌 User disconnected: ${socket.id} (reason: ${reason})`);
  });
});

// Handle Socket.IO connection errors
io.engine.on('connection_error', (err) => {
  console.error('❌ Socket.IO connection error:', {
    message: err.message,
    description: err.description,
    context: err.context,
    type: err.type
  });
});

server.listen(PORT, () => {
    console.log(`🚀 Server is now running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   API base: http://localhost:${PORT}/api`);
    console.log(`   Uploads: http://localhost:${PORT}/uploads`);
    console.log(`   Socket.IO: http://localhost:${PORT}`);
    console.log('');
    console.log('📚 Available endpoints:');
    console.log(`   - POST /api/auth/register`);
    console.log(`   - POST /api/auth/login`);
    console.log(`   - GET /api/courses`);
    console.log(`   - GET /api/courses/:id`);
    console.log(`   - POST /api/courses/:courseId/upload-proof`);
    console.log(`   - POST /api/payment-proof`);
    console.log(`   - GET /api/admin/payment-proofs/pending`);
    console.log(`   - PATCH /api/admin/payment-proofs/:id/approve`);
    console.log(`   - PATCH /api/admin/payment-proofs/:id/reject`);
    console.log(`   - POST /api/admin/orders/:orderId/approve`);
    console.log(`   - GET /api/courses/:courseId/access`);
});