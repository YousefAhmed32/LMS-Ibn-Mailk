# cURL Examples for Login Testing

## Prerequisites
Make sure the server is running on `http://localhost:5000`

## 1. Health Check
```bash
curl -X GET http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-10-02T18:00:00.000Z"
}
```

## 2. Successful Login - Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "admin@test.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "firstName": "Admin",
    "userEmail": "admin@test.com",
    "role": "admin",
    "isActive": true
  }
}
```

## 3. Successful Login - Student
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "student@test.com",
    "password": "student123"
  }'
```

## 4. Case-Insensitive Email Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "ADMIN@TEST.COM",
    "password": "admin123"
  }'
```

## 5. Invalid Email Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "nonexistent@test.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

## 6. Invalid Password Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "admin@test.com",
    "password": "wrongpassword"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

## 7. Missing Email Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Email and password are required"
}
```

## 8. Missing Password Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "admin@test.com"
  }'
```

## 9. Wrong Field Name Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Email and password are required"
}
```

## 10. Protected Route Test (using token from login)
```bash
# First, login and extract token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "admin@test.com", "password": "admin123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Then use token to access protected route
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## PowerShell Examples (Windows)

### Successful Login
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"userEmail":"admin@test.com","password":"admin123"}'
```

### Invalid Credentials
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"userEmail":"admin@test.com","password":"wrongpassword"}'
```

## Testing Script
Create a file `test-all-endpoints.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "🔍 Testing Login Endpoints..."

echo "1. Health Check"
curl -s $BASE_URL/health | jq .

echo -e "\n2. Valid Login"
curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"admin@test.com","password":"admin123"}' | jq .

echo -e "\n3. Invalid Email"
curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"wrong@test.com","password":"admin123"}' | jq .

echo -e "\n4. Invalid Password"
curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"admin@test.com","password":"wrong"}' | jq .

echo -e "\n✅ Testing Complete"
```

Make it executable: `chmod +x test-all-endpoints.sh`
Run it: `./test-all-endpoints.sh`
