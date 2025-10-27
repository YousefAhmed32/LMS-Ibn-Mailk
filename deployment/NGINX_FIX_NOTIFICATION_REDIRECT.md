# Fix for ERR_TOO_MANY_REDIRECTS Error on Notifications API

## Issue
The application was experiencing `ERR_TOO_MANY_REDIRECTS` errors when trying to access notification endpoints at `/api/notifications`.

## Root Cause
The nginx configuration had inconsistent `proxy_pass` directives without trailing slashes, which caused path handling issues and potential redirect loops.

## Changes Made

### 1. Added WebSocket Upgrade Map
Added at the top of the nginx config file to properly handle WebSocket connections:
```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
```

### 2. Fixed API Proxy Configuration
Changed from:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5000;
```

To:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5000/api/;
```

### 3. Fixed Uploads Proxy
Changed from:
```nginx
location /uploads/ {
    proxy_pass http://127.0.0.1:5000;
```

To:
```nginx
location /uploads/ {
    proxy_pass http://127.0.0.1:5000/uploads/;
```

### 4. Fixed GridFS Images Proxy
Changed from:
```nginx
location /api/image/ {
    proxy_pass http://127.0.0.1:5000;
```

To:
```nginx
location /api/image/ {
    proxy_pass http://127.0.0.1:5000/api/image/;
```

### 5. Fixed WebSocket Connection Header
Changed from hardcoded:
```nginx
proxy_set_header Connection "upgrade";
```

To using the mapped variable:
```nginx
proxy_set_header Connection $connection_upgrade;
```

## Deployment Instructions

### 1. Deploy the Updated Nginx Config
On your production server, run:

```bash
# Copy the updated config file
sudo cp /path/to/LMS-Arbic-Copy-2/deployment/nginx-ibnmailku.cloud.conf /etc/nginx/sites-available/ibnmailku.cloud

# Test the nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx
```

### 2. Verify Backend Server is Running
Check if the backend server is running on port 5000:

```bash
# Check if the server is running
pm2 list

# If not running, start it
cd /var/www/LMS-Ibn-Mailk/server
pm2 start server.js

# Check logs for errors
pm2 logs lms-api
```

### 3. Test the Notification API
After deploying, test the API:

```bash
# Test notification endpoint (replace with your actual token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://ibnmailku.cloud/api/notifications?limit=10

# Test unread count endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://ibnmailku.cloud/api/notifications/unread-count
```

### 4. Check Browser Network Tab
In your browser's developer console:
1. Open Network tab
2. Try accessing the notifications
3. Check if the request completes without redirect errors
4. Look for any 301/302 redirects in the response headers

## Troubleshooting

### If errors persist:

1. **Check nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Check backend logs:**
   ```bash
   pm2 logs lms-api
   ```

3. **Verify SSL certificates:**
   ```bash
   sudo certbot certificates
   ```

4. **Test backend health:**
   ```bash
   curl http://localhost:5000/health
   ```

### Common Issues:

1. **Backend not running**: Start with `pm2 start ecosystem.config.js`
2. **Nginx syntax error**: Run `sudo nginx -t` to check
3. **Port conflict**: Check if port 5000 is in use
4. **Firewall**: Ensure ports 80, 443, and 5000 are open

## Expected Behavior

After the fix:
- ✅ API requests should complete without redirect loops
- ✅ Notifications should load correctly
- ✅ No more `ERR_TOO_MANY_REDIRECTS` errors
- ✅ WebSocket connections should work properly
- ✅ Frontend can communicate with backend APIs

## Files Modified

- `deployment/nginx-ibnmailku.cloud.conf` - Updated nginx configuration

## Related Endpoints

The following endpoints should now work correctly:
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `GET /api/notifications/stats` - Get notification statistics
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

