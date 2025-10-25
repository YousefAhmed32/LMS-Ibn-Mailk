#!/usr/bin/env node

/**
 * Main Server File - Node.js + Express + MongoDB
 * 
 * This server provides user registration functionality with MongoDB integration.
 * Includes comprehensive logging and error handling.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const examRoutes = require('./server/routers/exam-routes');
const courseRoutes = require('./server/routers/course-routes');
const uploadRoutes = require('./server/routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

async function initializeServer() {
  log('🚀 ===== STARTING LMS SERVER =====', 'magenta');
  log(`📅 Server start time: ${new Date().toISOString()}`, 'blue');
  log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`, 'cyan');
  
  try {
    // Connect to MongoDB
    log('\n🔌 Connecting to MongoDB database...', 'cyan');
    await connectDB();
    log('✅ Database connection initialized', 'green');
    
    // Middleware setup
    log('\n⚙️  Setting up middleware...', 'cyan');
    app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Additional CORS headers for static files
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      next();
    });
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = './server/uploads';
    if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir, { recursive: true });
        log('📁 Created uploads directory', 'green');
    }
    
    // Serve uploaded files statically
    app.use('/uploads', express.static(path.join(__dirname, 'server', 'uploads')));
    log('✅ Static file serving configured for /uploads', 'green');
    
    // Request logging middleware
    app.use((req, res, next) => {
      const startTime = Date.now();
      
      // Log incoming request
      log(`📥 ${req.method} ${req.originalUrl}`, 'white');
      if (req.body && Object.keys(req.body).length > 0) {
        log(`📊 Request body: ${JSON.stringify(req.body)}`, 'cyan');
      }
      
      // Override res.json to log response
      const originalJson = res.json;
      res.json = function(body) {
        const duration = Date.now() - startTime;
        log(`📤 Response ${res.statusCode} sent in ${duration}ms`, res.statusCode >= 400 ? 'yellow' : 'green');
        originalJson.call(this, body);
      };
      
      next();
    });
    
    // Routes
    log('\n🛣️  Setting up routes...', 'cyan');
    app.use('/api/auth', authRoutes);
    log('✅ Authentication routes mounted at /api/auth', 'white');
    
    app.use('/api/exams', examRoutes);
    log('✅ Exam routes mounted at /api/exams', 'white');
    
    app.use('/api/courses', courseRoutes);
    log('✅ Course routes mounted at /api/courses', 'white');
    
    app.use('/api', uploadRoutes);
    log('✅ Upload routes mounted at /api', 'white');
    
    // Health check route
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running and healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
        database: {
          connected: true,
          readyState: require('mongoose').connection.readyState,
          name: require('mongoose').connection.name
        }
      });
    });
    
    // API documentation route
    app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'LMS API Server',
        version: '1.0.0',
        endpoints: {
          health: {
            url: 'GET /api/health',
            description: 'Check server health and database connection'
          },
          register: {
            url: 'POST /api/auth/register',
            description: 'Register a new user',
            requiredFields: ['name', 'email', 'password'],
            optionalFields: ['role']
          },
          testDb: {
            url: 'GET /api/auth/test-db',
            description: 'Test database connection and get stats'
          },
          users: {
            url: 'GET /api/auth/users',
            description: 'Get all users (testing purposes)'
          }
        },
        documentation: 'See README.md for detailed API documentation'
      });
    });
    
    // Root route
    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Welcome to LMS API Server',
        timestamp: new Date().toISOString(),
        endpoints: {
          api: 'GET /api - API documentation',
          health: 'GET /api/health - Server health check',
          register: 'POST /api/auth/register - User registration'
        },
        quickLinks: {
          registration: `${req.protocol}://${req.get('host')}/api/auth/register`,
          health: `${req.protocol}://${req.get('host')}/api/health`,
          documentation: `${req.protocol}://${req.get('host')}/api`
        }
      });
    });
    
    // 404 handler for undefined routes
    app.use('*', (req, res) => {
      log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`, 'yellow');
      res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
          'GET /',
          'GET /api',
          'GET /api/health',
          'POST /api/auth/register',
          'GET /api/auth/test-db',
          'GET /api/auth/users'
        ]
      });
    });
    
    // Global error handler
    app.use((err, req, res, next) => {
      log(`❌ Global error handler triggered:`, 'red');
      log(`   Error: ${err.message}`, 'red');
      log(`   Stack: ${err.stack}`, 'red');
      
      // Don't leak error details in production
      const errorResponse = {
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      };
      
      if (process.env.NODE_ENV === 'development') {
        errorResponse.error = err.message;
        errorResponse.stack = err.stack;
      }
      
      res.status(500).json(errorResponse);
    });
    
    // Start server
    const server = app.listen(PORT, () => {
      const endTime = Date.now();
      
      log('\n🎉 ===== SERVER STARTED SUCCESSFULLY =====', 'green');
      log(`🌐 Server URL: http://localhost:${PORT}`, 'blue');
      log(`🔗 Health check: http://localhost:${PORT}/api/health`, 'cyan');
      log(`📡 Registration: http://localhost:${PORT}/api/auth/register`, 'cyan');
      log(`📚 API docs: http://localhost:${PORT}/api`, 'cyan');
      
      log('\n📊 SERVER INFORMATION:', 'blue');
      log(`   Port: ${PORT}`, 'white');
      log(`   Environment: ${process.env.NODE_ENV || 'development'}`, 'white');
      log(`   MongoDB URI: ${process.env.MONGO_URL ? 'Set' : 'Not set'}`, 'white');
      log(`   Node version: ${process.version}`, 'white');
      log(`   Platform: ${process.platform}`, 'white');
      
      // Test database connection
      setTimeout(async () => {
        try {
          const User = require('./models/User');
          const stats = await User.getStats();
          log('\n📈 DATABASE STATUS:', 'blue');
          log(`   Total users: ${stats.total}`, 'white');
          log(`   Students: ${stats.students}`, 'white');
          log(`   Admins: ${stats.admins}`, 'white');
          log(`   Active users: ${stats.active}`, 'white');
        } catch (error) {
          log(`⚠️  Could not fetch database stats: ${error.message}`, 'yellow');
        }
      }, 1000);
      
      // Graceful shutdown handlers
      process.on('SIGINT', () => {
        log('\n🛑 SIGINT received, shutting down gracefully...', 'yellow');
        shutdown(server);
      });
      
      process.on('SIGTERM', () => {
        log('\n🛑 SIGTERM received, shutting down gracefully...', 'yellow');
        shutdown(server);
      });
      
      process.on('uncaughtException', (error) => {
        log(`\n💥 Uncaught Exception: ${error.message}`, 'red');
        console.error(error);
        shutdown(server, 1);
      });
      
      process.on('unhandledRejection', (reason, promise) => {
        log(`\n💥 Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
        console.error(reason);
      });
    });
    
    server.on('error', (error) => {
      log(`❌ Server error: ${error.message}`, 'red');
      
      if (error.code === 'EADDRINUSE') {
        log(`❌ Port ${PORT} is already in use!`, 'red');
        log('💡 Try using a different port:', 'yellow');
        log(`   PORT=5001 npm run dev`, 'white');
        log(`   Or kill the process using port ${PORT}`, 'white');
      }
      
      process.exit(1);
    });
    
  } catch (error) {
    log(`❌ Failed to initialize server: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

async function shutdown(server, exitCode = 0) {
  try {
    log('\n🔌 Closing server connections...', 'yellow');
    
    // Close HTTP server
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
    
    // Close database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      log('✅ Database connection closed', 'green');
    }
    
    log('✅ Server shutdown complete', 'green');
    process.exit(exitCode);
    
  } catch (error) {
    log(`❌ Error during shutdown: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Start the server
initializeServer().catch((error) => {
  log(`💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

module.exports = app;