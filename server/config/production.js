// Production Configuration for Server
module.exports = {
  // Socket.IO production settings
  socket: {
    cors: {
      origin: process.env.CLIENT_URL || "https://your-domain.com",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6,
    allowRequest: (req, fn) => {
      // Allow all requests in production
      fn(null, true);
    }
  },

  // Server settings
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0'
  },

  // Database settings
  database: {
    url: process.env.MONGODB_URI || process.env.DATABASE_URL
  },

  // CORS settings
  cors: {
    origin: process.env.CLIENT_URL || "https://your-domain.com",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
};
