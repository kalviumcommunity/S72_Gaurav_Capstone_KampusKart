const dotenv = require('dotenv');
dotenv.config();

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
const Chat = require('./models/Chat');

const app = express();

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
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

  // Handle new messages
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
      
      io.to('global-chat').emit('new-message', populatedMessage);
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