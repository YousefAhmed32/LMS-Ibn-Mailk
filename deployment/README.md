# LMS-Ibn-Mailk VPS Deployment Files

This directory contains all the configuration files and scripts needed to deploy the LMS project to your Hostinger VPS.

## Files in This Directory

### Configuration Files

1. **nginx-ibnmailku.cloud.conf**
   - Complete Nginx configuration for reverse proxy
   - Handles HTTP → HTTPS redirect
   - Proxies `/api/` and `/socket.io/` to backend
   - Serves React frontend build
   - Location: `/etc/nginx/sites-available/ibnmailku.cloud`

2. **ecosystem.config.js**
   - PM2 process manager configuration
   - Defines the Node.js backend process
   - Sets production environment variables
   - Location: `/var/www/LMS-Ibn-Mailk/ecosystem.config.js`

### Deployment Scripts

3. **deploy.sh**
   - Automated deployment script
   - Pulls code from Git
   - Installs dependencies
   - Builds frontend
   - Restarts PM2 and Nginx
   - Location: `/var/www/LMS-Ibn-Mailk/deployment/deploy.sh`
   - Usage: `./deployment/deploy.sh`

### Documentation

4. **DEPLOYMENT_GUIDE.md**
   - Complete step-by-step deployment instructions
   - Installation procedures
   - Configuration steps
   - Verification tests
   - Troubleshooting guide

5. **VPS_SETUP_CHECKLIST.md**
   - Pre-deployment checklist
   - Configuration verification checklist
   - Post-deployment validation
   - Quick command reference

## Quick Start

### First-Time Deployment

1. **Copy files to VPS:**
   ```bash
   # From your local machine
   scp -r deployment/ user@your-vps:/var/www/LMS-Ibn-Mailk/
   ```

2. **On VPS, follow the checklist:**
   ```bash
   # Open the deployment guide
   cat /var/www/LMS-Ibn-Mailk/deployment/DEPLOYMENT_GUIDE.md
   
   # Follow step-by-step from the guide
   ```

3. **Or use the automated script:**
   ```bash
   cd /var/www/LMS-Ibn-Mailk
   chmod +x deployment/deploy.sh
   ./deployment/deploy.sh
   ```

### Subsequent Deployments

After initial setup, you can simply run:

```bash
cd /var/www/LMS-Ibn-Mailk
./deployment/deploy.sh
```

## Key Changes Made

### Backend (server/server.js)

✅ **Removed HTTPS redirect** - Prevents redirect loops
✅ **Added trust proxy** - Proper IP forwarding from Nginx
✅ **Updated CORS** - Production domain with credentials
✅ **Socket.IO CORS** - Configured for production

### Frontend Build

- Environment variables set for production API URLs
- Build includes correct base URL: `https://ibnmailku.cloud`

### Nginx Configuration

✅ **HTTP → HTTPS redirect** - Only on port 80, prevents loops
✅ **API proxying** - `/api/` → backend port 5000
✅ **WebSocket support** - `/socket.io/` with upgrade headers
✅ **Frontend serving** - React SPA from dist folder
✅ **File upload support** - Large file handling (50MB)

## Environment Variables

### Backend (.env)

Required variables for `/var/www/LMS-Ibn-Mailk/server/.env`:

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

### Frontend (.env.production)

Required variables for `/var/www/LMS-Ibn-Mailk/client/.env.production`:

```env
VITE_API_URL=https://ibnmailku.cloud
VITE_API_BASE_URL=https://ibnmailku.cloud
VITE_SOCKET_URL=https://ibnmailku.cloud
```

## Deployment Flow

```
1. Developer pushes code to Git
2. On VPS: git pull origin master
3. Run deploy.sh script
   - Installs backend dependencies
   - Builds frontend (npm run build)
   - Restarts PM2 (lms-api)
   - Reloads Nginx
4. Server automatically serves updated code
```

## Testing Endpoints

After deployment, verify with these commands:

```bash
# Test backend directly (should return 200)
curl -I http://127.0.0.1:5000/api/health

# Test HTTPS API (should return 200)
curl -I https://ibnmailku.cloud/api/health

# Test registration endpoint
curl -X POST https://ibnmailku.cloud/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

## Monitoring

```bash
# View PM2 logs
pm2 logs lms-api

# Check PM2 status
pm2 status

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

Common issues and solutions are documented in:

- `DEPLOYMENT_GUIDE.md` - Full troubleshooting section
- `VPS_SETUP_CHECKLIST.md` - Verification checklist

Quick fixes:

```bash
# Restart application
pm2 restart lms-api

# Reload Nginx
sudo systemctl reload nginx

# Test Nginx config
sudo nginx -t

# Check MongoDB
sudo systemctl status mongodb
```

## Important Notes

1. **No HTTPS Redirect in Backend** - The problematic redirect middleware was removed to prevent loops
2. **Trust Proxy** - Backend now trusts Nginx proxy for proper IP forwarding
3. **CORS Configuration** - Accepts requests from production domain only
4. **PM2 Auto-Restart** - Configure PM2 startup on boot
5. **SSL Auto-Renewal** - Let's Encrypt certificates auto-renew

## Security Reminders

- ✅ Change `JWT_SECRET` from default value
- ✅ Keep MongoDB local (127.0.0.1 only)
- ✅ Use firewall (ports 80, 443 only)
- ✅ Enable SSH key authentication
- ✅ Regular updates scheduled

## Support

For detailed instructions, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `VPS_SETUP_CHECKLIST.md` - Verification checklist

For logs and monitoring:
```bash
pm2 logs lms-api --lines 100
sudo tail -100 /var/log/nginx/error.log
```

