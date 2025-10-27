# Registration Route Fix

## Issue
Registration endpoint returning 404 error: "Route not found"

## Root Cause
The Nginx configuration was stripping the `/api` prefix from requests, causing the backend to receive `/auth/register` instead of `/api/auth/register`. This caused the 404 error because the routes are mounted at `/api/auth`.

## Changes Made

### 1. Fixed Nginx proxy_pass configuration
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

This ensures the `/api` prefix is preserved when forwarding requests to the backend server.

### 2. Fixed server.js imports (Line 18) - For local development
Changed from:
```javascript
const authRoutes = require('./routes/auth');
```
To:
```javascript
const authRoutes = require('./server/routers/auth-routes');
```

### 3. Created missing database config file
Created `config/database.js` with proper MongoDB connection function that was being imported but didn't exist.

## Files Modified
- ✅ `deployment/nginx-ibnmailku.cloud.conf` - Fixed proxy_pass to preserve /api prefix
- ✅ `server.js` - Fixed auth routes import path (for local dev)
- ✅ `config/database.js` - Created new database connection config

## Next Steps for Production

1. **Upload the fixed Nginx configuration:**
   ```bash
   # On the server
   sudo cp deployment/nginx-ibnmailku.cloud.conf /etc/nginx/sites-available/ibnmailku.cloud
   ```

2. **Test and reload Nginx:**
   ```bash
   # Test the configuration
   sudo nginx -t
   
   # If test passes, reload Nginx
   sudo systemctl reload nginx
   ```

3. **Verify the endpoint works:**
   ```bash
   curl -X POST https://ibnmailku.cloud/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "Test",
       "secondName": "User", 
       "thirdName": "Middle",
       "fourthName": "Last",
       "email": "test@example.com",
       "password": "password123",
       "role": "student",
       "phoneStudent": "01000000000",
       "guardianPhone": "01000000001",
       "governorate": "Cairo",
       "grade": "grade10"
     }'
   ```
   - Should return 201 (success) or 400 (validation error), NOT 404

## Expected Behavior
- Before: 404 "Route not found" for `/api/auth/register`
- After: Endpoint responds with either:
  - 201: User created successfully
  - 400: Validation errors
  - 409: User already exists

## Technical Explanation
When Nginx has `location /api/` (with trailing slash) and `proxy_pass` without a path, it removes the prefix from the request. So:
- Request: `/api/auth/register`
- Forwarded to backend: `/auth/register` ❌

By adding the path to `proxy_pass`:
- Request: `/api/auth/register`
- Forwarded to backend: `/api/auth/register` ✅
