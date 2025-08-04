const dotenv = require('dotenv');
dotenv.config();

// Environment validation
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

console.log('✅ All required environment variables are configured');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const lostfoundRoutes = require('./routes/lostfound');
const profileRoutes = require('./routes/profile');
const complaintsRoutes = require('./routes/complaints');
const startDeletionCronJob = require('./cron/deleteItems');
const http = require('http');
const { Server } = require('socket.io');
const newsRoutes = require('./routes/news');
const eventsRoutes = require('./routes/events');
const facilitiesRoutes = require('./routes/facilities');
const chatRoutes = require('./routes/chat');
const clubsRoutes = require('./routes/clubs');
const Chat = require('./models/Chat');

const app = express();

// Security middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://kampuskart.netlify.app',
      'https://s72-gaurav-capstone.onrender.com'
    ];
    // Log the origin for debugging
    console.log('CORS check:', { origin });
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (!Array.isArray(allowedOrigins)) {
      return callback(new Error('CORS misconfiguration: allowedOrigins is not an array'), false);
    }
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lostfound', lostfoundRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/lost-found', lostfoundRoutes);
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/clubs', clubsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Server startup status endpoint
app.get('/api/server-status', (req, res) => {
  res.status(200).json({ 
    status: 'ready', 
    message: 'Server is ready to handle requests',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log error details for debugging
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
    ...(isDevelopment && { error: err })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start the cron job after successful DB connection
    startDeletionCronJob();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Exit the process if DB connection fails
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: function(origin, callback) {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://kampuskart.netlify.app',
        'https://s72-gaurav-capstone.onrender.com'
      ];
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 1e8, // 100MB
});

// Make io accessible in routes
app.set('io', io);

// Keep track of online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  // User joins the chat
  socket.on('join', async (userData) => {
    onlineUsers.set(socket.id, userData);
    socket.join('global-chat');
    
    // Send online users list to all clients
    io.emit('online-users', Array.from(onlineUsers.values()));
    
    // Send last 50 messages to the new user
    const messages = await Chat.find({ isDeleted: false })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('sender', 'name profilePicture')
      .lean();
    
    socket.emit('previous-messages', messages.reverse());
  });

  // Handle new messages (this is a fallback, main message handling is via HTTP API)
  socket.on('send-message', async (messageData) => {
    try {
      const chatMessage = new Chat({
        sender: messageData.senderId,
        message: messageData.message
      });
      
      await chatMessage.save();
      
      const populatedMessage = await Chat.findById(chatMessage._id)
        .populate('sender', 'name profilePicture')
        .lean();
      
      // Emit to all clients except sender to prevent duplicates
      socket.to('global-chat').emit('new-message', populatedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle typing indicator
  socket.on('typing', (userData) => {
    socket.to('global-chat').emit('user-typing', userData);
  });

  // Handle stop typing
  socket.on('stop-typing', (userData) => {
    socket.to('global-chat').emit('user-stop-typing', userData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const userData = onlineUsers.get(socket.id);
    if (userData) {
      onlineUsers.delete(socket.id);
      io.emit('online-users', Array.from(onlineUsers.values()));
      io.emit('user-left', userData);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 