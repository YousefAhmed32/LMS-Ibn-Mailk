#!/usr/bin/env node

// Start server with correct configuration for login fix
require('dotenv').config();

// Set environment variables if not already set
process.env.MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://YOUNSLMS2026:YOUNSLMS2026%40My@cluster0.kmutmnk.mongodb.net/';
process.env.MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
process.env.PORT = process.env.PORT || '5000';

console.log('🚀 Starting LMS Server with Login Fixes...');
console.log('📊 Configuration:');
console.log(`   MongoDB: ${process.env.MONGO_URL ? '✅ Atlas' : '❌ Not set'}`);
console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
console.log(`   Port: ${process.env.PORT}`);
console.log('');

// Start the main server
require('./server.js');
