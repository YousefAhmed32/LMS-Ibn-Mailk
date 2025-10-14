# LMS Authentication System - Server

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URL=mongodb://localhost:27017/lms_platform

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Client URL for CORS
CLIENT_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "firstName": "أحمد",
  "secondName": "محمد",
  "thirdName": "علي",
  "fourthName": "حسن",
  "userEmail": "ahmed@example.com",
  "password": "password123",
  "phoneStudent": "01234567890",
  "phoneFather": "01234567891",
  "phoneMother": "01234567892",
  "governorate": "Cairo",
  "grade": "grade10",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### POST `/api/auth/login`
Login user and return JWT.

**Request Body:**
```json
{
  "userEmail": "ahmed@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### GET `/api/auth/me`
Get current logged-in user (requires JWT token).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

#### PUT `/api/auth/update`
Update user profile (requires JWT token).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "firstName": "أحمد",
  "phoneStudent": "01234567890",
  "governorate": "Giza"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### GET `/api/auth/users` (Admin Only)
Get all users with pagination and filtering.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role (student/admin)
- `grade`: Filter by grade
- `governorate`: Filter by governorate

#### GET `/api/auth/users/:userId` (Admin Only)
Get user by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## User Schema

```javascript
{
  // Full Arabic Name
  firstName: String (required),
  secondName: String (required),
  thirdName: String (required),
  fourthName: String (required),

  // Authentication
  userEmail: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['student', 'admin'], default: 'student'),

  // Contact Information
  phoneStudent: String (required),
  phoneFather: String (optional),
  phoneMother: String (optional),

  // Location and Education
  governorate: String (required, enum: Egyptian governorates),
  grade: String (required, enum: grade7-grade12),

  // LMS Features
  enrolledCourses: [ObjectId] (references to Course model),
  wallet: {
    balance: Number (default: 0),
    transactions: [{
      amount: Number,
      type: String (enum: ['credit', 'debit']),
      description: String,
      date: Date
    }]
  },

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation with express-validator
- ✅ Role-based access control (Student/Admin)
- ✅ Protected routes middleware
- ✅ Comprehensive error handling
- ✅ Egyptian phone number validation
- ✅ Governorate and grade validation
- ✅ Wallet system with transactions
- ✅ Course enrollment support
- ✅ Pagination for user listing
- ✅ Timestamps for all records

## Security Features

- JWT tokens with 7-day expiration
- Password hashing with bcrypt (12 rounds)
- Input sanitization and validation
- Role-based route protection
- CORS configuration
- Environment variable protection

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation details
}
```

## Testing

Test the API endpoints using tools like:
- Postman
- Insomnia
- Thunder Client (VS Code extension)
- curl commands

## Notes

- Ensure MongoDB is running before starting the server
- Change JWT_SECRET in production
- All phone numbers should be valid Egyptian numbers
- Governorate must be one of the predefined Egyptian governorates
- Grade must be one of: grade7, grade8, grade9, grade10, grade11, grade12
