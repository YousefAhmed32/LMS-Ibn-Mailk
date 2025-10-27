// PM2 Configuration for LMS API
// Location: /var/www/LMS-Ibn-Mailk/ecosystem.config.js
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [{
    name: 'lms-api',
    cwd: '/var/www/LMS-Ibn-Mailk/server',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGO_URL: 'mongodb://127.0.0.1:27017/LMS',
      JWT_SECRET: 'secret123',
      BASE_URL: 'https://ibnmailku.cloud',
      CLIENT_URL: 'https://ibnmailku.cloud',
      CORS_ORIGIN: 'https://ibnmailku.cloud',
      API_BASE_URL: 'https://ibnmailku.cloud'
    },
    
    // Logging
    error_file: '/var/log/pm2/lms-api-error.log',
    out_file: '/var/log/pm2/lms-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart settings
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Advanced settings
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};

