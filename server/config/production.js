// Production Configuration for Server
module.exports = {
  // Socket.IO production settings
  socket: {
    cors: {
      origin: process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : [
            process.env.CLIENT_URL || "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174",
            "https://ibnmailku.cloud"
          ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6,
    // Allow requests from behind nginx proxy
    allowRequest: (req, fn) => {
      // Allow all requests in production
      fn(null, true);
    },
    // Important for working behind nginx/proxy
    path: '/socket.io/',
    addTrailingSlash: false,
    handlePreflightRequest: (req, res) => {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
      });
      res.end();
    }
  },

  // Server settings
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0'
  },

  // Database settings
  database: {
    url: process.env.MONGO_URL || process.env.DATABASE_URL
  },

  // CORS settings
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
};
