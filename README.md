# Progressive Student Dashboard

A full-stack web application for tracking student learning progress across courses with real-time analytics, mentor dashboards, and adaptive recommendations.

## 🎯 Overview

The Progressive Student Dashboard is a comprehensive learning management system designed to help students track their progress across multiple courses while providing mentors with powerful analytics tools. The application features email-based authentication, role-based access control, real-time progress tracking, and data visualization.

### Key Highlights

- **Student-Centric Design**: Track completed lessons, time spent, and progress across all enrolled courses
- **Mentor Analytics**: Comprehensive dashboards showing student engagement, course completion rates, and activity trends
- **Email Verification**: Secure authentication with one-time verification codes sent via email
- **Data Visualization**: Interactive charts showing time-series trends and distribution analytics
- **CSV Export**: Download detailed progress reports for offline analysis
- **Adaptive Recommendations**: Smart suggestions for next learning steps based on progress patterns

## ✨ Features

### For Students
- ✅ Email-based registration and authentication with verification
- 📚 Browse and enroll in available courses
- 📊 Personal dashboard with progress metrics
- ⏱️ Track time spent on lessons
- 📈 Visualize learning trends over time
- 🎯 Receive personalized course recommendations
- 📥 Export progress data to CSV
- 📝 View detailed activity logs

### For Mentors
- 👥 Manage multiple courses and lessons
- 📊 View aggregated student analytics
- 📈 Track student engagement and completion rates
- ⏰ Monitor total time spent by students
- 📥 Export mentor dashboard data to CSV
- 🔍 View recent student activities across all courses

### Technical Features
- 🔐 JWT-based authentication with role-based access control
- 📧 Email verification using Nodemailer and Gmail SMTP
- 🎨 Responsive UI built with React and Tailwind CSS
- 📊 Interactive charts using Recharts
- 🔄 Real-time data updates with React Query
- 🛡️ Input validation and error handling
- 🗄️ MongoDB for scalable data storage

## 🏗️ Architecture

### System Design

The application follows a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  React + Vite + Tailwind CSS + React Query + Recharts       │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│     Express.js + JWT Auth + Input Validation + CORS         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Controllers  │→ │  Services    │→ │   Models     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│                    MongoDB + Mongoose                        │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Business logic is isolated in service files, controllers handle HTTP requests, and models define data schemas
2. **Role-Based Access Control**: JWT tokens embed user roles, enforced by middleware
3. **Secure Authentication**: Passwords are hashed with bcrypt, verification codes are hashed and time-limited
4. **API-First Design**: RESTful API with consistent response formats and error handling
5. **Scalable Data Model**: Normalized MongoDB schemas with proper indexing and relationships

### Authentication Flow

```
Registration → Email Verification → Login → JWT Token → Protected Routes
     ↓              ↓                  ↓         ↓              ↓
  Hash pwd    Send 6-digit code   Verify user  Sign token  Authorize role
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 4.22
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Email**: Nodemailer with Gmail SMTP
- **Validation**: express-validator
- **Security**: CORS, helmet-ready

### Frontend
- **Framework**: React 19.2
- **Build Tool**: Vite 8.0
- **Styling**: Tailwind CSS 4.3
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM 7.15
- **Charts**: Recharts 3.8
- **HTTP Client**: Axios 1.16
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Development Tools
- **Linting**: ESLint
- **Code Formatting**: Prettier-ready
- **Hot Reload**: Vite HMR + Node --watch

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0 (local or Atlas)
- Gmail account with App Password (for email verification)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd progressive-student-dashboard
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-dashboard
JWT_SECRET=your-secure-random-string-min-32-characters
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=your-gmail-address@gmail.com
EMAIL_VERIFICATION_MINUTES=15
```

> **Note**: To get a Gmail App Password:
> 1. Enable 2-Factor Authentication on your Google account
> 2. Go to Google Account → Security → 2-Step Verification → App passwords
> 3. Generate a new app password for "Mail"
> 4. Use this 16-character password in `EMAIL_PASS`

5. **Seed the database** (optional but recommended)
```bash
cd backend
npm run seed
```

This creates sample users, courses, enrollments, and activity logs.

6. **Start the backend server**
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

7. **Start the frontend development server**
```bash
cd ../frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### Quick Test

1. Open `http://localhost:5173` in your browser
2. Register a new account (student or mentor)
3. Check your email for the 6-digit verification code
4. Verify your email and log in
5. Explore the dashboard!

## 📁 Project Structure

```
progressive-student-dashboard/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── env.js                # Environment configuration
│   ├── controllers/
│   │   ├── ActivityController.js
│   │   ├── AuthController.js
│   │   ├── CourseController.js
│   │   ├── DashboardController.js
│   │   ├── EnrollmentController.js
│   │   └── MentorController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication & authorization
│   │   ├── errorHandler.js       # Global error handler
│   │   └── validate.js           # Request validation
│   ├── models/
│   │   ├── ActivityLog.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Lesson.js
│   │   └── User.js
│   ├── routes/
│   │   ├── activities.js
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── dashboard.js
│   │   ├── enrollments.js
│   │   └── mentor.js
│   ├── services/
│   │   ├── ActivityService.js
│   │   ├── AuthService.js
│   │   ├── CourseService.js
│   │   ├── DashboardService.js
│   │   ├── EmailService.js
│   │   ├── EnrollmentService.js
│   │   └── MentorService.js
│   ├── utils/
│   │   ├── csv.js                # CSV generation utilities
│   │   └── errors.js             # Custom error classes
│   ├── scripts/
│   │   └── seed.js               # Database seeding script
│   ├── .env                      # Environment variables
│   ├── .env.example              # Environment template
│   ├── package.json
│   └── server.js                 # Application entry point
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/               # Images and static files
│   │   ├── components/
│   │   │   ├── ActivityChart.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── DistributionChart.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProgressRing.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── hooks/
│   │   │   └── useConfirm.js     # Confirmation dialog hook
│   │   ├── pages/
│   │   │   ├── ActivityLogs.jsx
│   │   │   ├── CourseDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MentorDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js            # Axios instance
│   │   │   └── endpoints.js      # API endpoint definitions
│   │   ├── utils/
│   │   │   └── downloadCsv.js    # CSV download utility
│   │   ├── App.jsx               # Main app component
│   │   ├── App.css
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

## 📚 API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick Reference

**Base URL**: `http://localhost:5000/api`

#### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/verify-email` - Verify email with code
- `POST /auth/resend-verification` - Resend verification code
- `GET /auth/me` - Get current user

#### Student Endpoints (requires student role)
- `GET /dashboard` - Get student dashboard
- `GET /dashboard/time-series` - Get time-series data
- `GET /dashboard/aggregate` - Get aggregate statistics
- `GET /dashboard/export` - Export dashboard to CSV
- `GET /activities` - Get activity logs
- `POST /enrollments` - Enroll in course
- `PUT /enrollments/:id/complete-lesson` - Mark lesson complete
- `PUT /enrollments/:id/log-time` - Log study time

#### Mentor Endpoints (requires mentor role)
- `GET /mentor/dashboard` - Get mentor dashboard
- `GET /mentor/dashboard/export` - Export mentor data to CSV
- `POST /courses` - Create new course
- `POST /courses/:id/lessons` - Add lesson to course

#### Shared Endpoints (authenticated)
- `GET /courses` - List all courses
- `GET /courses/:id` - Get course details

For detailed request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `5000` | Yes |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/student-dashboard` | Yes |
| `JWT_SECRET` | Secret key for JWT signing | `your-secure-random-string-min-32-chars` | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` | Yes |
| `BCRYPT_ROUNDS` | Bcrypt hashing rounds | `10` | Yes |
| `EMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` | Yes |
| `EMAIL_PASS` | Gmail app password | `your-app-password` | Yes |
| `EMAIL_FROM` | From address in emails | `your-email@gmail.com` | Yes |
| `EMAIL_VERIFICATION_MINUTES` | Verification code validity | `15` | Yes |

### Frontend Environment Variables

The frontend uses Vite's environment variable system. Create `frontend/.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 💻 Development

### Backend Development

```bash
cd backend

# Start with hot reload
npm run dev

# Run seeding script
npm run seed

# Start production server
npm start
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Database Seeding

The seed script creates:
- 2 mentor accounts
- 5 student accounts
- 6 courses with lessons
- Sample enrollments and activity logs

```bash
cd backend
npm run seed
```

**Seeded Accounts**:
- Mentor: `mentor1@example.com` / `password123`
- Mentor: `mentor2@example.com` / `password123`
- Student: `student1@example.com` / `password123`
- Student: `student2@example.com` / `password123`
- (and more...)

### Code Style

- Use ES6+ features and modules
- Follow consistent naming conventions (camelCase for variables, PascalCase for components)
- Add JSDoc comments for complex functions
- Use async/await for asynchronous operations
- Handle errors gracefully with try-catch blocks

## 🚢 Deployment

### Backend Deployment

1. **Environment Setup**
   - Set all environment variables on your hosting platform
   - Use a production MongoDB instance (MongoDB Atlas recommended)
   - Generate a strong JWT secret (32+ characters)

2. **Build & Deploy**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

3. **Recommended Platforms**
   - Railway
   - Render
   - Heroku
   - AWS EC2
   - DigitalOcean

### Frontend Deployment

1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy the `dist` folder**
   - Vercel (recommended)
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

3. **Update API URL**
   - Set `VITE_API_BASE_URL` to your production backend URL
   - Rebuild after changing environment variables

### Production Checklist

- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Use production MongoDB instance
- [ ] Enable HTTPS for both frontend and backend
- [ ] Configure CORS for production domain
- [ ] Set up error monitoring (Sentry, LogRocket)
- [ ] Enable rate limiting on API endpoints
- [ ] Set up automated backups for MongoDB
- [ ] Configure CDN for frontend assets
- [ ] Set up CI/CD pipeline
- [ ] Add health check endpoints
- [ ] Configure logging and monitoring

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Follow existing code style
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- UI powered by [React](https://react.dev/) and [Tailwind CSS](https://tailwindcss.com/)
- Charts by [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for better learning experiences**
