# Progressive Student Dashboard - API Documentation

## Overview

The Progressive Student Dashboard API is a RESTful service built with Express.js and MongoDB. It provides endpoints for student progress tracking, mentor analytics, course management, and activity logging with role-based access control.

###  For seeding the data run: npm run seed  ###

### Key Features
- JWT-based authentication with email verification
- Role-based authorization (student/mentor)
- Real-time progress tracking
- Time-series analytics
- CSV data export
- Input validation and error handling

---

## Architecture & Approach

### System Design

The API follows a **layered architecture** pattern:

```
Routes → Controllers → Services → Models → Database
```

- **Routes**: Define HTTP endpoints and apply middleware (validation, authentication)
- **Controllers**: Handle HTTP requests/responses, delegate business logic to services
- **Services**: Contain business logic, data transformation, and complex operations
- **Models**: Define MongoDB schemas and data validation rules
- **Middleware**: Handle cross-cutting concerns (auth, validation, error handling)

### Authentication Flow

1. **Registration**: User registers with email/password → System hashes password → Generates 6-digit verification code → Sends code via email
2. **Verification**: User submits code → System validates code and expiry → Returns JWT token
3. **Authorization**: Client includes JWT in `Authorization` header → Middleware verifies token → Extracts user role → Grants/denies access

### Email Verification

- Verification codes are 6-digit random numbers
- Codes are hashed before storage (bcrypt)
- Codes expire after 15 minutes (configurable)
- Users must verify email before login
- Codes can be resent if expired

### Data Model

**User** → has role (student/mentor)
**Course** → belongs to mentor, has many lessons
**Lesson** → belongs to course
**Enrollment** → links student to course, tracks progress
**ActivityLog** → records student actions (lesson completion, time spent)

---

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

---

## Authentication

Most endpoints require authentication via JWT token.

### Including the Token

Add the token to the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`). After expiration, users must log in again.

---

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": [ ... ]
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_EMAIL`: Email already registered
- `INVALID_CREDENTIALS`: Wrong email/password
- `EMAIL_NOT_VERIFIED`: Email verification required
- `INVALID_CODE`: Verification code incorrect or expired

---

## API Endpoints

### Authentication Endpoints

#### 1. Register User

Create a new student or mentor account.

**Endpoint**: `POST /api/auth/register`

**Access**: Public

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "student"
}
```

**Field Validation**:
- `name`: Required, non-empty string
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `role`: Optional, either "student" or "mentor" (default: "student")

**Success Response** (201):
```json
{
  "message": "Registration successful. Please check your email for verification code.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "isVerified": false
  }
}
```

**Error Responses**:
- 400: Validation error
- 409: Email already registered

---

#### 2. Verify Email

Verify email address with 6-digit code sent via email.

**Endpoint**: `POST /api/auth/verify-email`

**Access**: Public

**Request Body**:
```json
{
  "email": "jane@example.com",
  "code": "123456"
}
```

**Field Validation**:
- `email`: Required, valid email format
- `code`: Required, exactly 6 digits

**Success Response** (200):
```json
{
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "isVerified": true
  }
}
```

**Error Responses**:
- 400: Invalid or expired code
- 404: User not found

---

#### 3. Resend Verification Code

Request a new verification code.

**Endpoint**: `POST /api/auth/resend-verification`

**Access**: Public

**Request Body**:
```json
{
  "email": "jane@example.com"
}
```

**Success Response** (200):
```json
{
  "message": "Verification code sent to your email"
}
```

**Error Responses**:
- 400: Email already verified
- 404: User not found

---

#### 4. Login

Authenticate user and receive JWT token.

**Endpoint**: `POST /api/auth/login`

**Access**: Public

**Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Field Validation**:
- `email`: Required, valid email format
- `password`: Required, non-empty

**Success Response** (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "avatar": ""
  }
}
```

**Error Responses**:
- 400: Email not verified
- 401: Invalid credentials

---

#### 5. Get Current User

Retrieve authenticated user's profile.

**Endpoint**: `GET /api/auth/me`

**Access**: Authenticated users

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200):
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "avatar": "",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- 401: Unauthorized (invalid/missing token)

---

### Student Dashboard Endpoints

All student dashboard endpoints require authentication and student role.

**Required Headers**:
```
Authorization: Bearer <token>
```

---

#### 1. Get Student Dashboard

Retrieve student's dashboard summary with enrolled courses and progress.

**Endpoint**: `GET /api/dashboard`

**Access**: Students only

**Success Response** (200):
```json
{
  "summary": {
    "totalCourses": 3,
    "completedCourses": 1,
    "inProgressCourses": 2,
    "totalLessonsCompleted": 15,
    "totalTimeSpent": 450,
    "averageProgress": 65.5
  },
  "enrolledCourses": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "course": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Introduction to React",
        "description": "Learn React fundamentals",
        "thumbnail": "https://example.com/react.jpg",
        "totalLessons": 10,
        "mentor": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "John Mentor"
        }
      },
      "progressPercentage": 80,
      "completedLessons": 8,
      "totalTimeSpent": 240,
      "status": "in_progress",
      "lastAccessedAt": "2024-01-20T14:30:00.000Z"
    }
  ],
  "recommendations": [
    {
      "courseId": "507f1f77bcf86cd799439015",
      "title": "Advanced React Patterns",
      "reason": "Continue your React journey"
    }
  ]
}
```

---

#### 2. Get Time Series Data

Retrieve daily time spent data for visualization.

**Endpoint**: `GET /api/dashboard/time-series`

**Access**: Students only

**Query Parameters**:
- `startDate` (optional): ISO 8601 date string (e.g., "2024-01-01")
- `endDate` (optional): ISO 8601 date string (e.g., "2024-01-31")

**Example Request**:
```
GET /api/dashboard/time-series?startDate=2024-01-01&endDate=2024-01-31
```

**Success Response** (200):
```json
{
  "timeSeries": [
    {
      "date": "2024-01-15",
      "minutesSpent": 45
    },
    {
      "date": "2024-01-16",
      "minutesSpent": 60
    },
    {
      "date": "2024-01-17",
      "minutesSpent": 30
    }
  ]
}
```

---

#### 3. Get Aggregate Statistics

Retrieve aggregated statistics for charts (status distribution, course distribution).

**Endpoint**: `GET /api/dashboard/aggregate`

**Access**: Students only

**Success Response** (200):
```json
{
  "statusDistribution": [
    { "status": "completed", "count": 1 },
    { "status": "in_progress", "count": 2 },
    { "status": "not_started", "count": 0 }
  ],
  "courseDistribution": [
    { "courseName": "Introduction to React", "percentage": 80 },
    { "courseName": "Node.js Basics", "percentage": 50 },
    { "courseName": "MongoDB Essentials", "percentage": 100 }
  ]
}
```

---

#### 4. Export Dashboard to CSV

Download student progress data as CSV file.

**Endpoint**: `GET /api/dashboard/export`

**Access**: Students only

**Success Response** (200):
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="student-progress-{date}.csv"`

**CSV Format**:
```csv
Course,Progress,Completed Lessons,Total Lessons,Time Spent (min),Status,Last Accessed
Introduction to React,80%,8,10,240,in_progress,2024-01-20
Node.js Basics,50%,5,10,120,in_progress,2024-01-19
MongoDB Essentials,100%,8,8,90,completed,2024-01-18
```

---

### Activity Endpoints

#### Get Activity Logs

Retrieve student's activity history with optional filters.

**Endpoint**: `GET /api/activities`

**Access**: Students only

**Query Parameters**:
- `startDate` (optional): ISO 8601 date string
- `endDate` (optional): ISO 8601 date string
- `courseId` (optional): MongoDB ObjectId
- `activityType` (optional): One of `lesson_started`, `lesson_completed`, `time_spent`, `course_completed`

**Example Request**:
```
GET /api/activities?courseId=507f1f77bcf86cd799439013&activityType=lesson_completed
```

**Success Response** (200):
```json
{
  "activities": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "activityType": "lesson_completed",
      "course": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Introduction to React"
      },
      "lesson": {
        "_id": "507f1f77bcf86cd799439021",
        "title": "React Hooks"
      },
      "minutesSpent": 45,
      "activityDate": "2024-01-20T14:30:00.000Z",
      "createdAt": "2024-01-20T14:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

### Enrollment Endpoints

All enrollment endpoints require authentication and student role.

---

#### 1. Enroll in Course

Enroll the authenticated student in a course.

**Endpoint**: `POST /api/enrollments`

**Access**: Students only

**Request Body**:
```json
{
  "courseId": "507f1f77bcf86cd799439013"
}
```

**Field Validation**:
- `courseId`: Required, valid MongoDB ObjectId

**Success Response** (201):
```json
{
  "message": "Enrolled successfully",
  "enrollment": {
    "_id": "507f1f77bcf86cd799439030",
    "student": "507f1f77bcf86cd799439011",
    "course": "507f1f77bcf86cd799439013",
    "completedLessons": [],
    "progressPercentage": 0,
    "totalTimeSpent": 0,
    "status": "not_started",
    "lastAccessedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

**Error Responses**:
- 400: Already enrolled in this course
- 404: Course not found

---

#### 2. Get Enrollments

Retrieve all enrollments for the authenticated student.

**Endpoint**: `GET /api/enrollments`

**Access**: Students only

**Success Response** (200):
```json
{
  "enrollments": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "course": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Introduction to React",
        "description": "Learn React fundamentals",
        "totalLessons": 10,
        "mentor": {
          "name": "John Mentor"
        }
      },
      "progressPercentage": 80,
      "completedLessons": 8,
      "totalTimeSpent": 240,
      "status": "in_progress"
    }
  ]
}
```

---

#### 3. Complete Lesson

Mark a lesson as completed for an enrollment.

**Endpoint**: `PUT /api/enrollments/:id/complete-lesson`

**Access**: Students only

**URL Parameters**:
- `id`: Enrollment ID (MongoDB ObjectId)

**Request Body**:
```json
{
  "lessonId": "507f1f77bcf86cd799439021"
}
```

**Field Validation**:
- `lessonId`: Required, valid MongoDB ObjectId

**Success Response** (200):
```json
{
  "message": "Lesson marked as completed",
  "enrollment": {
    "_id": "507f1f77bcf86cd799439030",
    "progressPercentage": 90,
    "completedLessons": ["507f1f77bcf86cd799439021", "..."],
    "status": "in_progress"
  },
  "activityLog": {
    "_id": "507f1f77bcf86cd799439040",
    "activityType": "lesson_completed",
    "lesson": "507f1f77bcf86cd799439021"
  }
}
```

**Error Responses**:
- 400: Lesson already completed
- 404: Enrollment or lesson not found

---

#### 4. Log Study Time

Record time spent studying a lesson.

**Endpoint**: `PUT /api/enrollments/:id/log-time`

**Access**: Students only

**URL Parameters**:
- `id`: Enrollment ID (MongoDB ObjectId)

**Request Body**:
```json
{
  "lessonId": "507f1f77bcf86cd799439021",
  "minutesSpent": 45
}
```

**Field Validation**:
- `lessonId`: Required, valid MongoDB ObjectId
- `minutesSpent`: Required, integer >= 1

**Success Response** (200):
```json
{
  "message": "Time logged successfully",
  "enrollment": {
    "_id": "507f1f77bcf86cd799439030",
    "totalTimeSpent": 285
  },
  "activityLog": {
    "_id": "507f1f77bcf86cd799439041",
    "activityType": "time_spent",
    "minutesSpent": 45
  }
}
```

---

#### 5. Get Enrollment Lessons

Retrieve all lessons for a specific enrollment with completion status.

**Endpoint**: `GET /api/enrollments/:id/lessons`

**Access**: Students only

**URL Parameters**:
- `id`: Enrollment ID (MongoDB ObjectId)

**Success Response** (200):
```json
{
  "lessons": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "title": "React Hooks",
      "duration": 45,
      "order": 1,
      "isCompleted": true
    },
    {
      "_id": "507f1f77bcf86cd799439022",
      "title": "State Management",
      "duration": 60,
      "order": 2,
      "isCompleted": false
    }
  ],
  "enrollment": {
    "progressPercentage": 50,
    "completedLessons": 1,
    "totalLessons": 2
  }
}
```

---

### Course Endpoints

---

#### 1. Create Course (Mentor Only)

Create a new course.

**Endpoint**: `POST /api/courses`

**Access**: Mentors only

**Request Body**:
```json
{
  "title": "Advanced React Patterns",
  "description": "Learn advanced React concepts and patterns",
  "thumbnail": "https://example.com/advanced-react.jpg"
}
```

**Field Validation**:
- `title`: Required, non-empty string
- `description`: Optional, string
- `thumbnail`: Optional, string (URL)

**Success Response** (201):
```json
{
  "message": "Course created successfully",
  "course": {
    "_id": "507f1f77bcf86cd799439050",
    "title": "Advanced React Patterns",
    "description": "Learn advanced React concepts and patterns",
    "thumbnail": "https://example.com/advanced-react.jpg",
    "mentor": "507f1f77bcf86cd799439014",
    "totalLessons": 0,
    "totalDuration": 0,
    "createdAt": "2024-01-20T16:00:00.000Z"
  }
}
```

---

#### 2. Get All Courses

Retrieve list of all courses with optional mentor filter.

**Endpoint**: `GET /api/courses`

**Access**: Authenticated users

**Query Parameters**:
- `mentorId` (optional): Filter courses by mentor ID

**Example Request**:
```
GET /api/courses?mentorId=507f1f77bcf86cd799439014
```

**Success Response** (200):
```json
{
  "courses": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Introduction to React",
      "description": "Learn React fundamentals",
      "thumbnail": "https://example.com/react.jpg",
      "totalLessons": 10,
      "totalDuration": 450,
      "mentor": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "John Mentor",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### 3. Get Course Details

Retrieve detailed information about a specific course including all lessons.

**Endpoint**: `GET /api/courses/:id`

**Access**: Authenticated users

**URL Parameters**:
- `id`: Course ID (MongoDB ObjectId)

**Success Response** (200):
```json
{
  "course": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Introduction to React",
    "description": "Learn React fundamentals",
    "thumbnail": "https://example.com/react.jpg",
    "totalLessons": 10,
    "totalDuration": 450,
    "mentor": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "John Mentor",
      "email": "john@example.com"
    },
    "lessons": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "title": "React Hooks",
        "duration": 45,
        "order": 1
      },
      {
        "_id": "507f1f77bcf86cd799439022",
        "title": "State Management",
        "duration": 60,
        "order": 2
      }
    ],
    "createdAt": "2024-01-10T10:00:00.000Z"
  }
}
```

**Error Responses**:
- 404: Course not found

---

#### 4. Add Lesson to Course (Mentor Only)

Add a new lesson to an existing course.

**Endpoint**: `POST /api/courses/:id/lessons`

**Access**: Mentors only (must be course owner)

**URL Parameters**:
- `id`: Course ID (MongoDB ObjectId)

**Request Body**:
```json
{
  "title": "React Context API",
  "duration": 50,
  "order": 3
}
```

**Field Validation**:
- `title`: Required, non-empty string
- `duration`: Optional, integer >= 0 (default: 0)
- `order`: Optional, integer >= 1 (default: auto-incremented)

**Success Response** (201):
```json
{
  "message": "Lesson added successfully",
  "lesson": {
    "_id": "507f1f77bcf86cd799439023",
    "course": "507f1f77bcf86cd799439013",
    "title": "React Context API",
    "duration": 50,
    "order": 3,
    "createdAt": "2024-01-20T17:00:00.000Z"
  },
  "course": {
    "totalLessons": 11,
    "totalDuration": 500
  }
}
```

**Error Responses**:
- 403: Not authorized (not course owner)
- 404: Course not found

---

### Mentor Dashboard Endpoints

All mentor dashboard endpoints require authentication and mentor role.

---

#### 1. Get Mentor Dashboard

Retrieve comprehensive analytics for all mentor's courses.

**Endpoint**: `GET /api/mentor/dashboard`

**Access**: Mentors only

**Success Response** (200):
```json
{
  "summary": {
    "totalCourses": 3,
    "totalStudents": 25,
    "totalEnrollments": 45,
    "averageCompletionRate": 68.5,
    "totalTimeSpent": 3450
  },
  "courses": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Introduction to React",
      "totalLessons": 10,
      "enrolledStudents": 15,
      "averageProgress": 75.5,
      "completionRate": 60,
      "totalTimeSpent": 1800
    }
  ],
  "recentActivities": [
    {
      "_id": "507f1f77bcf86cd799439060",
      "student": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "course": {
        "title": "Introduction to React"
      },
      "lesson": {
        "title": "React Hooks"
      },
      "activityType": "lesson_completed",
      "activityDate": "2024-01-20T14:30:00.000Z"
    }
  ],
  "topPerformers": [
    {
      "student": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "coursesCompleted": 2,
      "averageProgress": 95,
      "totalTimeSpent": 450
    }
  ]
}
```

---

#### 2. Export Mentor Dashboard to CSV

Download mentor analytics data as CSV file.

**Endpoint**: `GET /api/mentor/dashboard/export`

**Access**: Mentors only

**Success Response** (200):
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename="mentor-dashboard-{date}.csv"`

**CSV Format**:
```csv
Course,Enrolled Students,Average Progress,Completion Rate,Total Time Spent (min)
Introduction to React,15,75.5%,60%,1800
Node.js Basics,10,65.0%,50%,1200
MongoDB Essentials,8,80.0%,75%,450
```

---

## Environment Variables

Required backend environment variables:

```env
# Server Configuration
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/student-dashboard

# JWT Configuration
JWT_SECRET=your-secure-random-string-minimum-32-characters
JWT_EXPIRES_IN=7d

# Password Hashing
BCRYPT_ROUNDS=10

# Email Configuration (Gmail SMTP)
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=your-gmail-address@gmail.com
EMAIL_VERIFICATION_MINUTES=15
```

### Getting Gmail App Password

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Use the 16-character password in `EMAIL_PASS`

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding rate limiting middleware to prevent abuse.

**Recommended**: Use `express-rate-limit` package:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## CORS Configuration

The API allows requests from:
- Any `localhost` port (development)
- Configured production domains

To add production domains, update `server.js`:

```javascript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://your-production-domain.com',
      'https://www.your-production-domain.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}));
```

---

## Testing the API

### Using cURL

**Register a user**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get dashboard** (with token):
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API endpoints into Postman
2. Set up an environment variable for `baseUrl` and `token`
3. Use `{{baseUrl}}` and `{{token}}` in requests
4. After login, save the token to the environment variable

---

## Best Practices

### Security
- Always use HTTPS in production
- Store JWT_SECRET securely (use environment variables, never commit to git)
- Implement rate limiting to prevent brute force attacks
- Validate and sanitize all user inputs
- Use strong password requirements
- Implement refresh tokens for better security

### Performance
- Add database indexes on frequently queried fields
- Implement caching for frequently accessed data (Redis)
- Use pagination for large data sets
- Optimize MongoDB queries with projections
- Consider implementing GraphQL for flexible data fetching

### Monitoring
- Implement logging (Winston, Morgan)
- Set up error tracking (Sentry)
- Monitor API performance (New Relic, DataDog)
- Track API usage and metrics

---

## Support

For issues or questions:
- Check the [README.md](./README.md) for setup instructions
- Review error messages and status codes
- Contact the development team

---

**Last Updated**: January 2024
**API Version**: 1.0.0
