# SunCoop Staff Management - Backend API

This is the backend API for the SunCoop Staff Management System, built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user management with profiles and permissions
- **Shift Management**: Create, assign, and manage work shifts
- **Time Tracking**: Clock in/out functionality
- **Real-time Updates**: Socket.IO for real-time notifications and updates
- **File Uploads**: Handle profile pictures and documents
- **Email Service**: SMTP-based email sending with beautiful HTML templates
- **Logging**: Comprehensive logging with Winston
- **Security**: Rate limiting, CORS, helmet, and other security features

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: Express Validator
- **Logging**: Winston
- **Security**: Helmet, CORS, bcryptjs
- **File Upload**: Multer
- **Email**: SendGrid / Nodemailer
- **SMS**: Twilio (optional)

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   - Copy `.env.example` to `.env`
   - Update the environment variables with your configuration

   ```bash
   cp .env.example .env
   ```

   **Required Environment Variables**:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/suncoop_staff
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   
   # Email Configuration (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_APP_PASSWORD=your_app_password_here
   FROM_EMAIL=your_email@gmail.com
   ```

4. **Database Setup**:
   - Make sure MongoDB is running locally, or
   - Set up a MongoDB Atlas cluster and update `MONGODB_URI`

5. **Email Setup (Gmail SMTP)**:
   - Enable 2-Factor Authentication on your Gmail account
   - Generate an App Password:
     1. Go to Google Account settings
     2. Security → 2-Step Verification
     3. App passwords → Generate password
     4. Use this password in `SMTP_APP_PASSWORD` (not your regular Gmail password)

## Running the Application

### Development Mode
```bash
npm run dev
```
This runs the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

### Database Seeding (Optional)
```bash
npm run seed
```
This will initialize the database with sample data.

## API Endpoints

The API base URL is: `http://localhost:3001/api`

### Authentication
- `POST /api/auth/register` - Register initial admin (system setup)
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get user profile

### Shifts
- `GET /api/shifts` - Get shifts

### Time Tracking
- `GET /api/time-entries` - Get time entries

### Locations
- `GET /api/locations` - Get locations

### Reports
- `GET /api/reports` - Get reports

### Notifications
- `GET /api/notifications` - Get notifications

### Settings
- `GET /api/settings` - Get settings

### Health Check
- `GET /api/health` - API health check

### Documentation
- `GET /api/docs` - API documentation (development only)

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # Database connection
│   │   └── ...
│   ├── controllers/     # Route controllers
│   │   └── authController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/          # Database models
│   │   └── User.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── ...
│   ├── services/        # Business logic services
│   ├── socket/          # Socket.IO configuration
│   │   └── index.js
│   ├── utils/           # Utility functions
│   │   └── logger.js
│   └── app.js           # Express app configuration
├── tests/               # Test files
├── logs/                # Log files
├── uploads/             # File uploads
├── scripts/             # Database scripts
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js            # Application entry point
```

## Environment Variables

See `.env.example` for all available environment variables. Key variables include:

- **Server**: `PORT`, `NODE_ENV`, `API_BASE_URL`
- **Database**: `MONGODB_URI`
- **Authentication**: `JWT_SECRET`, `JWT_REFRESH_SECRET`
- **Email**: `SENDGRID_API_KEY`, `FROM_EMAIL`
- **SMS**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` (optional)
- **Security**: `CORS_ORIGIN`, `RATE_LIMIT_*`

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevent brute force attacks
- **CORS**: Cross-origin resource sharing protection
- **Helmet**: Security headers
- **Input Validation**: Express validator for request validation
- **SQL Injection Protection**: Mongoose ODM protection

## Logging

The application uses Winston for logging:
- **Development**: Console logging with colors
- **Production**: File logging with rotation
- **Error Tracking**: Separate error log files

## Real-time Features

Socket.IO is used for real-time features:
- **Live Notifications**: Instant notifications to users
- **Shift Updates**: Real-time shift status changes
- **Time Tracking**: Live time tracking updates
- **Location Updates**: Real-time location tracking

## API Documentation

For detailed API documentation, see the `BACKEND_API_SPECIFICATION.md` file in the project root.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or open an issue in the repository. 