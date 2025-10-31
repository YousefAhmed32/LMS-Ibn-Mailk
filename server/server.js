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

// Import centralized error handler (✅ moved up)
const errorHandler = require('./middleware/errorHandler');

// Security middleware
const { configureCSP, configureSecurityHeaders } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/lms-ebn";

// Disable x-powered-by for security
app.disable('x-powered-by');

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

// Import all routes
// let authRoutes;
// try {
//     authRoutes = require("./routers/auth-routes/index");
//     console.log('✅ Auth routes loaded successfully');
// } catch (error) {
//     console.error('❌ Error loading auth routes:', error.message);
//     authRoutes = require("./routers/auth-routes");
// }
const authRoutes = require("./routers/auth-routes/index");
console.log('✅ Auth routes loaded successfully');
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

// Performance middleware
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Security middleware
app.use(configureCSP());
app.use(configureSecurityHeaders());

// Trust proxy (behind Nginx)
app.set('trust proxy', 1);

// CORS setup
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
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

// Body parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use('/api', (req, res, next) => {
    console.log(`📨 ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        origin: req.get('origin'),
        userAgent: req.get('user-agent')?.substring(0, 50),
    });
    next();
});

// Mount routes
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

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ✅ Move this above 404
app.get("/api/routes", (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router' && middleware.regexp) {
            const basePath = middleware.regexp.source.replace(/\\\//g, '/').replace(/\^|\$|\?/g, '');
            routes.push({ path: basePath, methods: ['*'], type: 'router' });
        }
    });
    res.json({
        success: true,
        totalRoutes: routes.length,
        routes: routes.sort((a, b) => a.path.localeCompare(b.path))
    });
});

// 404 handler
app.use("*", (req, res) => {
    if (!req.originalUrl.startsWith('/socket.io') && !req.originalUrl.startsWith('/uploads')) {
        console.log(`⚠️ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    }
    res.status(404).json({
        success: false,
        error: "Route not found",
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use(errorHandler);

// Connect to MongoDB before starting server
mongoose.connect(MONGO_URL)
    .then(() => {
        console.log(`✔️ MongoDB connected to ${MONGO_URL}`);
        console.log('   Collections:', Object.keys(mongoose.connection.collections));
        startServer();
    })
    .catch((e) => {
        console.log("❌ MongoDB connection error:", e.message);
        process.exit(1);
    });

// Start server in a function
function startServer() {
    const server = http.createServer(app);
    const productionConfig = require('./config/production');
    const io = new Server(server, productionConfig.socket);
    app.set('io', io);
    global.io = io;

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);
        
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`👤 User ${userId} joined room: user_${userId}`);
            }
        });
        
        socket.on('join-group', (groupId) => {
            if (groupId) {
                socket.join(`group_${groupId}`);
                console.log(`👥 User ${socket.id} joined group: group_${groupId}`);
            }
        });
        
        socket.on('leave-group', (groupId) => {
            if (groupId) {
                socket.leave(`group_${groupId}`);
                console.log(`👥 User ${socket.id} left group: group_${groupId}`);
            }
        });
        
        socket.on('error', (error) => {
            console.error(`❌ Socket error for ${socket.id}:`, error);
        });
        
        socket.on('disconnect', (reason) => {
            console.log(`🔌 User disconnected: ${socket.id} (reason: ${reason})`);
        });
    });

    // Handle Socket.IO connection errors
    io.engine.on('connection_error', (err) => {
        console.error('❌ Socket.IO connection error:', {
            message: err.message,
            description: err.description,
            type: err.type
        });
    });

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`   Listening on: 0.0.0.0:${PORT}`);
        console.log(`   Health check: http://localhost:${PORT}/health`);
        console.log(`   API base: http://localhost:${PORT}/api`);
        console.log(`   Socket.IO: http://localhost:${PORT}`);
        console.log('✅ Server ready to accept connections');
    });

    // Handle server errors
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use`);
            console.error('   Please stop the other process or use a different port');
        } else {
            console.error('❌ Server error:', error);
        }
        process.exit(1);
    });
}
