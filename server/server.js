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

const authRoutes = require("./routers/auth-routes");
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
const uploadRoutes = require("./routers/upload-routes");
const gridfsUploadRoutes = require("./routes/upload");
const userDashboardRoutes = require("./routers/user-dashboard-routes");
const parentRoutes = require("./routers/parent-routes");
const enhancedParentRoutes = require("./routes/enhanced-parent-routes");
const debugRoutes = require("./routes/debug-routes");
const adminDashboardRoutes = require("./routes/admin-dashboard-routes");

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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit - زيادة الحد لحل مشكلة 413
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

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

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
});

// Middleware
app.use(cors({
    origin: [
        process.env.CLIENT_URL || "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Body parsing with size limits - زيادة الحدود لحل مشكلة 413
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));


// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
    console.log('📁 Created uploads directory');
}

// Serve uploaded files with enhanced debugging and error handling
app.use('/uploads', (req, res, next) => {
  console.log('📁 Static file request:', {
    path: req.path,
    originalUrl: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer')
  });
  next();
}, express.static('uploads', {
  // Enhanced static file serving options
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set CORS headers for images
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    console.log('📁 Serving file:', path, 'with headers:', {
      'Content-Type': res.get('Content-Type'),
      'Cache-Control': res.get('Cache-Control'),
      'Access-Control-Allow-Origin': res.get('Access-Control-Allow-Origin')
    });
  }
}));

// Handle OPTIONS requests for CORS
app.options('/uploads/*', (req, res) => {
  console.log('🔄 OPTIONS request for uploads:', req.path);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.status(200).end();
});

// Fallback for missing uploads
app.use('/uploads', (req, res) => {
  console.log('❌ File not found:', req.path);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(404).json({
    success: false,
    message: 'File not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/auth", authRoutes);
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

app.use("/api/uploads", uploadRoutes);
app.use("/api/user", userDashboardRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/parent", enhancedParentRoutes);
app.use("/api/debug", debugRoutes);

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

// Global error handler
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        path: req.originalUrl,
        method: req.method
    });
});

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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Handle user joining their room
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined room: user_${userId}`);
    }
  });

  // Handle joining group chat room
  socket.on('join-group', (groupId) => {
    if (groupId) {
      socket.join(`group_${groupId}`);
      console.log(`👥 User ${socket.id} joined group room: group_${groupId}`);
    }
  });

  // Handle leaving group chat room
  socket.on('leave-group', (groupId) => {
    if (groupId) {
      socket.leave(`group_${groupId}`);
      console.log(`👥 User ${socket.id} left group room: group_${groupId}`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
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