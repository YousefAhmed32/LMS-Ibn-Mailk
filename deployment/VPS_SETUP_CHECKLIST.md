# VPS Setup Checklist for ibnmailku.cloud

Use this checklist to ensure everything is properly configured on your VPS.

## Pre-Deployment Checks

- [ ] SSH access to VPS working
- [ ] Domain DNS points to VPS IP (A record)
- [ ] Root or sudo access available
- [ ] Git is installed
- [ ] Node.js v18+ is installed (`node --version`)
- [ ] MongoDB is installed and running
- [ ] PM2 is installed globally (`pm2 --version`)
- [ ] Nginx is installed and running
- [ ] Ports 80, 443 open in firewall

## Deployment Steps

### 1. Project Files
- [ ] Project cloned/copied to `/var/www/LMS-Ibn-Mailk/`
- [ ] Backend folder exists at `/var/www/LMS-Ibn-Mailk/server/`
- [ ] Frontend folder exists at `/var/www/LMS-Ibn-Mailk/client/`

### 2. Backend Configuration
- [ ] `.env` file created at `/var/www/LMS-Ibn-Mailk/server/.env`
- [ ] Variables set in `.env`:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `MONGO_URL=mongodb://127.0.0.1:27017/LMS`
  - [ ] `JWT_SECRET` set (NOT default value)
  - [ ] `BASE_URL=https://ibnmailku.cloud`
  - [ ] `CORS_ORIGIN=https://ibnmailku.cloud`

### 3. Frontend Configuration
- [ ] `.env.production` created at `/var/www/LMS-Ibn-Mailk/client/.env.production`
- [ ] Variables set:
  - [ ] `VITE_API_URL=https://ibnmailku.cloud`
  - [ ] `VITE_API_BASE_URL=https://ibnmailku.cloud`
  - [ ] `VITE_SOCKET_URL=https://ibnmailku.cloud`

### 4. Dependencies Installation
- [ ] Backend: `cd server && npm install --production`
- [ ] Frontend: `cd client && npm install`
- [ ] No errors during installation

### 5. Frontend Build
- [ ] Build completed: `cd client && npm run build`
- [ ] Dist folder exists at `/var/www/LMS-Ibn-Mailk/client/dist/`
- [ ] `index.html` exists in dist folder

### 6. SSL Certificate
- [ ] Let's Encrypt certificate installed
- [ ] Certificate paths:
  - [ ] `/etc/letsencrypt/live/ibnmailku.cloud/fullchain.pem`
  - [ ] `/etc/letsencrypt/live/ibnmailku.cloud/privkey.pem`
- [ ] Auto-renewal configured

### 7. Nginx Configuration
- [ ] Config file copied to `/etc/nginx/sites-available/ibnmailku.cloud`
- [ ] Symlink created: `/etc/nginx/sites-enabled/ibnmailku.cloud`
- [ ] Config tested: `sudo nginx -t`
- [ ] No errors in test
- [ ] Nginx reloaded: `sudo systemctl reload nginx`

### 8. PM2 Configuration
- [ ] `ecosystem.config.js` copied to `/var/www/LMS-Ibn-Mailk/`
- [ ] Application started: `pm2 start ecosystem.config.js`
- [ ] Application saved: `pm2 save`
- [ ] Startup configured: `pm2 startup`

### 9. File Permissions
- [ ] Uploads directory exists
- [ ] Proper permissions on uploads: `sudo chmod -R 755 /var/www/LMS-Ibn-Mailk/server/uploads`
- [ ] PM2 log directory exists: `/var/log/pm2/`
- [ ] Write permissions on log directory

## Verification Tests

### Backend Tests
- [ ] Test backend health: `curl -I http://127.0.0.1:5000/health`
- [ ] Returns HTTP 200
- [ ] Test API endpoint: `curl -I http://127.0.0.1:5000/api/`
- [ ] Returns HTTP 200

### HTTPS Tests
- [ ] Test HTTPS health: `curl -I https://ibnmailku.cloud/health`
- [ ] Returns HTTP 200
- [ ] Test HTTPS API: `curl -I https://ibnmailku.cloud/api/`
- [ ] Returns HTTP 200
- [ ] No redirect loop

### Frontend Test
- [ ] Visit https://ibnmailku.cloud in browser
- [ ] Frontend loads correctly
- [ ] No console errors in browser
- [ ] Can navigate to different pages

### API Tests
- [ ] Test registration endpoint:
  ```bash
  curl -X POST https://ibnmailku.cloud/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","password":"test123"}'
  ```
- [ ] Returns JSON response
- [ ] No network errors

### PM2 Status
- [ ] Run: `pm2 status lms-api`
- [ ] Shows status "online"
- [ ] Shows uptime
- [ ] No errors in status

### Logs Check
- [ ] Run: `pm2 logs lms-api --lines 50`
- [ ] No critical errors
- [ ] Database connected successfully
- [ ] Server listening on port 5000

## Common Issues Resolution

If issues occur, check:

### Redirect Loop (ERR_TOO_MANY_REDIRECTS)
- [ ] Backend has `app.set('trust proxy', 1)`
- [ ] No HTTPS redirect middleware in backend
- [ ] Nginx sets `X-Forwarded-Proto https`

### WebSocket/Socket.IO Not Working
- [ ] Socket.IO CORS includes `https://ibnmailku.cloud`
- [ ] Nginx has `/socket.io/` location block
- [ ] Upgrade headers present in Nginx

### CORS Errors
- [ ] `CORS_ORIGIN` in backend `.env` includes domain
- [ ] Socket.IO config includes domain
- [ ] Restarted PM2 after .env changes

### 413 Request Entity Too Large
- [ ] Nginx has `client_max_body_size 50M`
- [ ] Reloaded Nginx: `sudo systemctl reload nginx`

### Database Connection Failed
- [ ] MongoDB running: `sudo systemctl status mongodb`
- [ ] Connection string correct: `mongodb://127.0.0.1:27017/LMS`
- [ ] Test connection: `mongo --eval "db.getName()"`

## Post-Deployment

After successful deployment:

- [ ] Document deployed version/tag
- [ ] Monitor logs for 24 hours
- [ ] Check SSL auto-renewal working
- [ ] Set up monitoring/alerting (optional)
- [ ] Configure backups

## Quick Commands Reference

```bash
# Check PM2 status
pm2 status
pm2 logs lms-api

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check MongoDB status
sudo systemctl status mongodb

# Restart services
pm2 restart lms-api
sudo systemctl reload nginx

# View logs
pm2 logs lms-api
sudo tail -f /var/log/nginx/error.log

# Test connectivity
curl -I https://ibnmailku.cloud/api/
curl http://127.0.0.1:5000/api/health
```

## Security Checklist

- [ ] Changed `JWT_SECRET` from default
- [ ] Firewall configured (ports 80, 443 open only)
- [ ] MongoDB not exposed to public network
- [ ] SSH key-based authentication enabled
- [ ] Fail2ban installed and configured (optional)
- [ ] Regular updates scheduled

## Performance Checks

- [ ] Nginx compression enabled
- [ ] Static assets cached properly
- [ ] Database indexes created
- [ ] PM2 using appropriate instance count
- [ ] Server resources adequate (CPU, RAM)

