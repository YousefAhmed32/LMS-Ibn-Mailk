# VPS Deployment Guide for ibnmailku.cloud

## Overview
This guide explains how to deploy the LMS-Ibn-Mailk project to a Hostinger VPS with proper Nginx reverse proxy, SSL, and Socket.IO support.

## Prerequisites

- VPS with Ubuntu 20.04 or newer
- Domain configured: ibnmailku.cloud
- MongoDB installed locally on VPS
- PM2 installed globally
- Nginx installed
- Let's Encrypt SSL certificates configured

## Project Structure on VPS

```
/var/www/LMS-Ibn-Mailk/
├── server/          # Backend Node.js application
├── client/          # Frontend React application
├── uploads/         # Uploaded files
├── ecosystem.config.js  # PM2 configuration
└── deploy.sh       # Deployment script
```

## Deployment Steps

### 1. Initial Server Setup

#### Install Node.js (if not installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install PM2 globally
```bash
npm install -g pm2
```

#### Install MongoDB (if not installed)
```bash
sudo apt-get install -y mongodb
sudo systemctl enable mongodb
sudo systemctl start mongodb
```

#### Install Nginx (if not installed)
```bash
sudo apt-get install -y nginx
sudo systemctl enable nginx
```

### 2. Clone/Copy Project Files

If using Git:
```bash
cd /var/www
sudo git clone <your-repo-url> LMS-Ibn-Mailk
cd LMS-Ibn-Mailk
```

### 3. Environment Configuration

#### Backend Environment Variables

Create `/var/www/LMS-Ibn-Mailk/server/.env`:

```env
NODE_ENV=production
PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/LMS
JWT_SECRET=secret123
BASE_URL=https://ibnmailku.cloud
CLIENT_URL=https://ibnmailku.cloud
CORS_ORIGIN=https://ibnmailku.cloud
API_BASE_URL=https://ibnmailku.cloud
```

#### Client Environment Variables

Create `/var/www/LMS-Ibn-Mailk/client/.env.production`:

```env
VITE_API_URL=https://ibnmailku.cloud
VITE_API_BASE_URL=https://ibnmailku.cloud
VITE_SOCKET_URL=https://ibnmailku.cloud
```

### 4. Install Dependencies

```bash
# Backend
cd /var/www/LMS-Ibn-Mailk/server
npm install --production

# Frontend
cd /var/www/LMS-Ibn-Mailk/client
npm install
```

### 5. Build Frontend

```bash
cd /var/www/LMS-Ibn-Mailk/client
npm run build
```

### 6. Configure SSL with Let's Encrypt

If not already configured:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ibnmailku.cloud -d www.ibnmailku.cloud
```

### 7. Setup Nginx Configuration

Copy the nginx configuration file:

```bash
sudo cp /var/www/LMS-Ibn-Mailk/deployment/nginx-ibnmailku.cloud.conf \
       /etc/nginx/sites-available/ibnmailku.cloud
```

Create symlink:

```bash
sudo ln -s /etc/nginx/sites-available/ibnmailku.cloud \
           /etc/nginx/sites-enabled/
```

Remove default site (optional):

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Test configuration:

```bash
sudo nginx -t
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

### 8. Setup PM2

```bash
cd /var/www/LMS-Ibn-Mailk
sudo cp deployment/ecosystem.config.js ./

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs (usually: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-username --hp /home/your-username)
```

### 9. Make Deploy Script Executable

```bash
chmod +x /var/www/LMS-Ibn-Mailk/deployment/deploy.sh
```

## Running Deployments

For future updates, simply run:

```bash
/var/www/LMS-Ibn-Mailk/deployment/deploy.sh
```

Or if you've made it executable:

```bash
cd /var/www/LMS-Ibn-Mailk
./deployment/deploy.sh
```

## Verification

### Test Backend Direct Access
```bash
curl -I http://127.0.0.1:5000/api/health
```

Expected: HTTP 200 with JSON response

### Test HTTPS API
```bash
curl -I https://ibnmailku.cloud/api/health
```

Expected: HTTP 200 with JSON response

### Test Registration Endpoint
```bash
curl -X POST https://ibnmailku.cloud/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123456"}'
```

Expected: JSON response with success or validation error

### Check PM2 Status
```bash
pm2 status lms-api
pm2 logs lms-api --lines 50
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Monitoring

### View Real-time Logs
```bash
pm2 logs lms-api --lines 50 --raw
```

### Restart Application
```bash
pm2 restart lms-api
```

### Check Application Status
```bash
pm2 status
pm2 info lms-api
```

### View Nginx Access Logs
```bash
sudo tail -f /var/log/nginx/access.log
```

### View Nginx Error Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Issue: ERR_TOO_MANY_REDIRECTS

**Solution:** 
1. Verify backend has `app.set('trust proxy', 1)` set
2. Ensure NO HTTPS redirect middleware in backend
3. Check Nginx `X-Forwarded-Proto` header is set to `https`

### Issue: WebSocket Connection Failed

**Solution:**
1. Check Socket.IO CORS includes production domain
2. Verify `/socket.io/` location has Upgrade headers in Nginx
3. Check firewall allows WebSocket connections

### Issue: CORS Errors

**Solution:**
1. Update `CORS_ORIGIN` in backend `.env` file
2. Verify `credentials: true` in Socket.IO config
3. Restart PM2: `pm2 restart lms-api`

### Issue: 413 Request Entity Too Large

**Solution:**
1. Verify `client_max_body_size 50M` in Nginx config
2. Check backend body parser limit: `limit: '20mb'`
3. Reload Nginx: `sudo systemctl reload nginx`

### Issue: Database Connection Failed

**Solution:**
1. Check MongoDB is running: `sudo systemctl status mongodb`
2. Verify connection string in `.env`: `mongodb://127.0.0.1:27017/LMS`
3. Test connection: `mongo mongodb://127.0.0.1:27017/LMS`

## Rollback

If something goes wrong:

```bash
# Stop the application
pm2 stop lms-api

# Rollback to previous version
cd /var/www/LMS-Ibn-Mailk
git checkout HEAD~1

# Rebuild and restart
cd client && npm run build && cd ..
pm2 restart lms-api
```

## Security Notes

1. **JWT_SECRET**: Change from default `secret123` in production
2. **Firewall**: Ensure ports 80, 443 are open, 5000 is NOT exposed publicly
3. **MongoDB**: Do not expose to public, only localhost access
4. **SSL**: Let's Encrypt certificates auto-renew
5. **Logs**: Regularly rotate PM2 and Nginx logs

## File Uploads

Uploaded files are stored in:
- Local: `/var/www/LMS-Ibn-Mailk/server/uploads/`
- GridFS: MongoDB GridFS storage

Make sure this directory has proper permissions:
```bash
sudo chown -R www-data:www-data /var/www/LMS-Ibn-Mailk/server/uploads
```

## Backup Strategy

Recommended backup schedule:
1. Database: Weekly MongoDB dump
2. Uploads: Daily file backup
3. Code: Git repository

```bash
# Database backup example
mongodump --db=LMS --out=/backup/mongodb-$(date +%Y%m%d)

# Uploads backup
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /var/www/LMS-Ibn-Mailk/server/uploads
```

## Performance Optimization

1. Enable Nginx gzip compression
2. Use PM2 clustering (if multi-core CPU)
3. Enable MongoDB indexing
4. Use CDN for static assets (optional)

## Support

For issues or questions, check:
- PM2 logs: `pm2 logs lms-api`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Application logs: `/var/log/pm2/lms-api-error.log`

