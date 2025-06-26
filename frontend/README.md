# SunCoop Staff Management PWA

A comprehensive Progressive Web Application for staff management, built with React and Express.js.

## 🚀 Features

- **Full Backend Integration**: Complete Express.js backend with MongoDB
- **Authentication**: JWT-based secure authentication system
- **Staff Management**: Comprehensive user management with role-based access
- **Shift Scheduling**: Create, assign, and manage work shifts
- **Time Tracking**: Clock in/out functionality
- **Real-time Updates**: Socket.IO for live notifications and updates
- **Reports & Analytics**: Comprehensive reporting system
- **PWA Support**: Offline functionality and mobile app-like experience

- **Email Notifications**: SMTP-based email system

## 🛠️ Tech Stack

### Frontend
- **React 18** with hooks and modern patterns
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Zustand** for state management
- **React Router** for navigation
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time features
- **Nodemailer** for email services
- **Winston** for logging
- **Bcrypt** for password hashing

## 📋 Prerequisites

- **Node.js** 18+ 
- **MongoDB** (local or Atlas)
- **Gmail account** with app password (for emails)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd suncoopPWA
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration:
# - MongoDB connection string
# - JWT secrets
# - Gmail credentials
# - Other settings
```

### 3. Frontend Setup
```bash
# Navigate to root directory (if not already there)
cd ..

# Install dependencies
npm install

# Environment is already configured in .env
```

### 4. Database Setup
```bash
# In backend directory, seed the database (optional)
cd backend
npm run seed
```

## 🚀 Running the Application

### Development Mode

1. **Start the Backend Server**:
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:3001

2. **Start the Frontend Development Server**:
```bash
# In root directory
npm run dev
```
Frontend will run on http://localhost:5173

### Production Mode

1. **Build the Frontend**:
```bash
npm run build
```

2. **Start the Backend**:
```bash
cd backend
npm start
```

## 🔐 Initial Setup

1. **Access the Application**: Navigate to http://localhost:5173
2. **Admin Setup**: If this is the first time, you'll be prompted to create an admin account
3. **Complete Setup**: Fill in organization details and admin credentials
4. **Start Using**: Begin managing staff, creating shifts, and tracking time

## 📊 API Integration Status

✅ **Authentication**: Fully integrated with JWT and refresh tokens
✅ **User Management**: Complete CRUD operations for users
✅ **Shift Management**: Full shift lifecycle management
✅ **Time Tracking**: Clock in/out with real-time updates

✅ **Notifications**: Real-time notifications via Socket.IO
✅ **Reports**: Analytics and reporting system
✅ **Email Services**: Welcome emails and notifications

**Mock Data**: ❌ **Completely Removed** - All components now use real API data

## 🏗️ Project Structure

```
suncoopPWA/
├── src/                    # Frontend source
│   ├── components/         # Reusable UI components
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API services
│   │   ├── store/          # State management
│   │   └── hooks/          # Custom React hooks
│   ├── backend/            # Backend API
│   │   ├── src/
│   │   │   ├── controllers/ # Route controllers
│   │   │   ├── models/      # Database models
│   │   │   ├── routes/      # API routes
│   │   │   ├── middleware/  # Custom middleware
│   │   │   ├── services/    # Business logic services
│   │   │   ├── socket/      # Socket.IO setup
│   │   │   └── utils/       # Utility functions
│   │   └── uploads/         # File uploads
│   └── public/             # Static assets
└── public/                 # Static assets
```

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=SunCoop Staff Management
VITE_SOCKET_URL=http://localhost:3001
```

### Backend (backend/.env)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/suncoop_staff
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_APP_PASSWORD=your_app_password
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when available)
npm test
```

## 📱 PWA Features

- **Offline Support**: Core functionality works offline
- **App Installation**: Can be installed as a native app
- **Push Notifications**: Real-time updates
- **Responsive Design**: Works on all device sizes

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt for secure passwords
- **Rate Limiting**: Prevent brute force attacks
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Comprehensive request validation

## 📈 Performance

- **Lazy Loading**: Code splitting for optimal loading
- **Caching**: Efficient data caching strategies
- **Optimized Builds**: Production-ready builds
- **Database Indexing**: Optimized database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Check the issues section
- Review the API documentation
- Contact the development team

---

**Note**: This application is now fully integrated with a real backend API. All mock data has been removed and replaced with actual API calls to the Express.js backend.
