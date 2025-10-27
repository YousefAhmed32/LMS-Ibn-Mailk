// Production Configuration for WebSocket
export const productionConfig = {
  // WebSocket settings for production
  socket: {
    cors: {
      origin: [
        import.meta.env.VITE_API_URL || 'http://localhost:5000',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:5174'
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['polling', 'websocket'],
    timeout: 30000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true,
    upgrade: true,
    rememberUpgrade: true
  },
  
  // API settings
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Fallback mechanisms
  fallback: {
    enablePolling: true,
    pollingInterval: 5000,
    maxRetries: 3
  }
};

// Environment detection
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

// Get server URL with fallback
export const getServerUrl = () => {
  if (isProduction) {
    return import.meta.env.VITE_API_URL || 
           import.meta.env.VITE_SERVER_URL || 
           window.location.origin;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};
