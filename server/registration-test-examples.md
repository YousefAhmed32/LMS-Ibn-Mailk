# Registration API Test Examples

## Prerequisites
Make sure the server is running on `http://localhost:5000`

## 1. Student Registration

### Frontend Format (what the form sends):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "secondName": "محمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "email": "student@test.com",
    "password": "password123",
    "phoneStudent": "01234567890",
    "guardianPhone": "01234567891",
    "governorate": "Cairo",
    "grade": "أولى ثانوي",
    "role": "student"
  }'
```

### Backend Expected Format (after field mapping):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "secondName": "محمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "userEmail": "student@test.com",
    "password": "password123",
    "phoneStudent": "01234567890",
    "guardianPhone": "01234567891",
    "governorate": "Cairo",
    "grade": "أولى ثانوي",
    "role": "student"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "firstName": "أحمد",
    "secondName": "محمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "userEmail": "student@test.com",
    "role": "student",
    "studentId": "STU1234567890",
    "phoneStudent": "01234567890",
    "guardianPhone": "01234567891",
    "governorate": "Cairo",
    "grade": "أولى ثانوي",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 2. Parent Registration

### Frontend Format (what the form sends):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "محمد",
    "secondName": "أحمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "email": "parent@test.com",
    "password": "password123",
    "phoneNumber": "01234567890",
    "studentRelation": "father",
    "role": "parent"
  }'
```

### Backend Expected Format (after field mapping):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "محمد",
    "secondName": "أحمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "userEmail": "parent@test.com",
    "password": "password123",
    "phoneNumber": "01234567890",
    "relation": "father",
    "role": "parent"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "firstName": "محمد",
    "secondName": "أحمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "userEmail": "parent@test.com",
    "role": "parent",
    "relation": "father",
    "phoneNumber": "01234567890",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 3. Login After Registration

### Student Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "student@test.com",
    "password": "password123"
  }'
```

### Parent Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "parent@test.com",
    "password": "password123"
  }'
```

## 4. Error Cases

### Missing Required Field:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "secondName": "محمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "password": "password123",
    "phoneStudent": "01234567890",
    "guardianPhone": "01234567891",
    "governorate": "Cairo",
    "grade": "أولى ثانوي",
    "role": "student"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Please check the following fields and try again",
  "details": [
    {
      "field": "userEmail",
      "message": "\"userEmail\" is required"
    }
  ]
}
```

### Invalid Email Format:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "secondName": "محمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "userEmail": "invalid-email",
    "password": "password123",
    "phoneStudent": "01234567890",
    "guardianPhone": "01234567891",
    "governorate": "Cairo",
    "grade": "أولى ثانوي",
    "role": "student"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Please check the following fields and try again",
  "details": [
    {
      "field": "userEmail",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Invalid Phone Number:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "secondName": "محمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "userEmail": "test@example.com",
    "password": "password123",
    "phoneStudent": "123",
    "guardianPhone": "01234567891",
    "governorate": "Cairo",
    "grade": "أولى ثانوي",
    "role": "student"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Please check the following fields and try again",
  "details": [
    {
      "field": "phoneStudent",
      "message": "Please provide a valid Egyptian phone number"
    }
  ]
}
```

## 5. PowerShell Examples (Windows)

### Student Registration:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{
    "firstName": "أحمد",
    "secondName": "محمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "userEmail": "student@test.com",
    "password": "password123",
    "phoneStudent": "01234567890",
    "guardianPhone": "01234567891",
    "governorate": "Cairo",
    "grade": "أولى ثانوي",
    "role": "student"
  }'
```

### Parent Registration:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{
    "firstName": "محمد",
    "secondName": "أحمد",
    "thirdName": "علي",
    "fourthName": "حسن",
    "userEmail": "parent@test.com",
    "password": "password123",
    "phoneNumber": "01234567890",
    "relation": "father",
    "role": "parent"
  }'
```

## 6. JavaScript/Node.js Examples

### Using axios:
```javascript
const axios = require('axios');

// Student registration
const studentData = {
  firstName: 'أحمد',
  secondName: 'محمد',
  thirdName: 'علي',
  fourthName: 'حسن',
  userEmail: 'student@test.com',
  password: 'password123',
  phoneStudent: '01234567890',
  guardianPhone: '01234567891',
  governorate: 'Cairo',
  grade: 'أولى ثانوي',
  role: 'student'
};

axios.post('http://localhost:5000/api/auth/register', studentData)
  .then(response => {
    console.log('Registration successful:', response.data);
  })
  .catch(error => {
    console.error('Registration failed:', error.response.data);
  });
```

### Using fetch:
```javascript
// Student registration
const studentData = {
  firstName: 'أحمد',
  secondName: 'محمد',
  thirdName: 'علي',
  fourthName: 'حسن',
  userEmail: 'student@test.com',
  password: 'password123',
  phoneStudent: '01234567890',
  guardianPhone: '01234567891',
  governorate: 'Cairo',
  grade: 'أولى ثانوي',
  role: 'student'
};

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(studentData)
})
.then(response => response.json())
.then(data => {
  console.log('Registration successful:', data);
})
.catch(error => {
  console.error('Registration failed:', error);
});
```

## 7. Field Validation Rules

### Required Fields for Students:
- `firstName`: 2-50 characters
- `secondName`: 2-50 characters
- `thirdName`: 2-50 characters
- `fourthName`: 2-50 characters
- `userEmail`: Valid email format
- `password`: Minimum 6 characters
- `phoneStudent`: Egyptian phone format (e.g., 01234567890)
- `guardianPhone`: Egyptian phone format
- `governorate`: Valid Egyptian governorate
- `grade`: Valid Egyptian grade
- `role`: 'student'

### Required Fields for Parents:
- `firstName`: 2-50 characters
- `secondName`: 2-50 characters
- `thirdName`: 2-50 characters
- `fourthName`: 2-50 characters
- `userEmail`: Valid email format
- `password`: Minimum 6 characters
- `phoneNumber`: Egyptian phone format
- `relation`: Valid relation (father, mother, guardian, etc.)
- `role`: 'parent'

### Valid Governorates:
Cairo, Giza, Qalyubia, Alexandria, Port Said, Ismailia, Suez, Damietta, Dakahlia, Sharqia, Gharbia, Monufia, Kafr El-Sheikh, Beheira, Marsa Matrouh, Fayoum, Beni Suef, Minya, Assiut, Sohag, Qena, Luxor, Aswan, Red Sea, New Valley, North Sinai, South Sinai

### Valid Grades:
أولى إعدادي, تانية إعدادي, تالتة إعدادي, أولى ثانوي, تانية ثانوي, تالتة ثانوي

### Valid Relations:
Father, Mother, Guardian, Other, father, mother, guardian, grandfather, grandmother, uncle, aunt
