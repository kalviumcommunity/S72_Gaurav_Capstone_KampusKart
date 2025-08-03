# 🚀 KampusKart Setup Guide

This guide will help you set up the KampusKart project with all the latest security improvements and optimizations.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- MongoDB (v4.4 or higher)
- Git

## 🔧 Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd KampusKart_Capstone/S72_Gaurav_Capstone
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/kampuskart

# JWT Configuration (IMPORTANT: Use a strong secret!)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (for password reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Google Maps API (for campus map features)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000

# Admin Configuration (comma-separated emails)
ADMIN_EMAILS=gauravkhandelwal205@gmail.com

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Security Configuration
BCRYPT_SALT_ROUNDS=12
JWT_EXPIRES_IN=24h
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Environment Configuration
Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Application Configuration
VITE_APP_NAME=KampusKart
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false

# External Services
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

## 🔒 Security Improvements Applied

### 1. **Removed Hardcoded Secrets**
- ✅ All JWT secrets now require environment variables
- ✅ Admin emails configurable via environment
- ✅ No fallback to default secrets

### 2. **Enhanced Input Validation**
- ✅ Added express-validator for server-side validation
- ✅ Input sanitization to prevent XSS attacks
- ✅ Comprehensive validation rules for all forms

### 3. **Security Headers**
- ✅ Added security headers to prevent common attacks
- ✅ XSS protection enabled
- ✅ Content type sniffing disabled
- ✅ Frame options set to deny

### 4. **Error Handling**
- ✅ Global error handling middleware
- ✅ Error boundaries in React components
- ✅ Proper error logging without exposing sensitive data

### 5. **Environment Validation**
- ✅ Server startup validation for required environment variables
- ✅ Frontend environment variable warnings
- ✅ Graceful handling of missing configuration

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server:**
```bash
cd backend
npm run dev
```

2. **Start Frontend Development Server:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Build

1. **Build Frontend:**
```bash
cd frontend
npm run build
```

2. **Start Production Server:**
```bash
cd backend
npm start
```

## 🔍 Testing the Setup

### 1. **Health Check**
Visit `http://localhost:5000/api/health` to verify the backend is running.

### 2. **Environment Validation**
Check the console logs for:
- ✅ "All required environment variables are configured"
- ✅ "Connected to MongoDB"

### 3. **Security Headers**
Use browser dev tools to verify security headers are present:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

## 🛠️ Additional Improvements

### 1. **Rate Limiting**
- Login attempts: 150 requests per 15 minutes
- Signup attempts: 125 requests per hour

### 2. **Input Validation**
- Email format validation
- Password strength requirements
- Input sanitization
- XSS prevention

### 3. **Error Boundaries**
- React error boundaries for graceful error handling
- Development error details
- User-friendly error messages

### 4. **Logging**
- Structured error logging
- Request/response logging
- Security event logging

## 🔧 Troubleshooting

### Common Issues

1. **"JWT_SECRET not configured"**
   - Ensure JWT_SECRET is set in your .env file
   - Use a strong, unique secret key

2. **"Missing required environment variables"**
   - Check that all required variables are set in .env
   - Restart the server after updating .env

3. **CORS errors**
   - Verify FRONTEND_URL is set correctly
   - Check that the frontend URL matches your setup

4. **MongoDB connection issues**
   - Ensure MongoDB is running
   - Check MONGODB_URI format
   - Verify network connectivity

### Debug Mode

Enable debug mode by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 📚 Next Steps

1. **Set up monitoring and logging**
2. **Configure automated testing**
3. **Implement caching strategies**
4. **Add API documentation**
5. **Set up CI/CD pipeline**

## 🤝 Contributing

Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

For support:
1. Check this setup guide
2. Review the main [README.md](README.md)
3. Check existing issues
4. Create a new issue if needed 