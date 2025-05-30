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
const chatRoutes = require('./routes/chat');
const complaintsRoutes = require('./routes/complaints');
const startDeletionCronJob = require('./cron/deleteItems');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lostfound', lostfoundRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/complaints', complaintsRoutes);

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
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 1e8, // 100MB
});

// Keep track of online users: userId -> socketId
let onlineUsers = {};

// Keep track of user's active conversations
let userConversations = {};

io.on('connection', (socket) => {
  console.log('Connected to socket.io');

  // Setup user and add to online users list
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    onlineUsers[userData._id] = socket.id;
    socket.emit('connected');
    console.log(`User ${userData.name} (${userData._id}) connected. Online users: ${Object.keys(onlineUsers).length}`);

    // Emit online users list to the user who just connected
    socket.emit('online users', Object.keys(onlineUsers));

    // Broadcast the new user's online status to others
    socket.broadcast.emit('user online', userData._id);
  });

  // Join a chat room (conversation)
  socket.on('join chat', (room) => {
    socket.join(room);
    const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
    if (userId) {
      if (!userConversations[userId]) {
        userConversations[userId] = new Set();
      }
      userConversations[userId].add(room);
    }
    console.log('User Joined Room: ' + room);
  });

  // Send new message
  socket.on('new message', (newMessageReceived) => {
    const chat = newMessageReceived.conversation;
    if (!chat.participants) return console.log('Chat participants not defined');

    // Emit to all participants in the chat
    chat.participants.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      // Check if the recipient is online
      const recipientSocketId = onlineUsers[user._id];
      if (recipientSocketId) {
        // If online, emit with 'delivered' status
        io.to(recipientSocketId).emit('message received', {
          ...newMessageReceived,
          status: 'delivered'
        });
      } else {
        // If offline, emit with 'sent' status
        io.to(user._id).emit('message received', {
          ...newMessageReceived,
          status: 'sent'
        });
      }
    });
  });

  // Message read status
  socket.on('message read', (data) => {
    const { conversationId, messageId } = data;
    const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
    
    if (userId) {
      socket.to(conversationId).emit('message read', {
        messageId,
        readBy: userId
      });
    }
  });

  // Typing indicator
  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  // Disconnect user and remove from online users list
  socket.on('disconnect', () => {
    const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
    if (userId) {
      delete onlineUsers[userId];
      delete userConversations[userId];
      console.log(`User ${userId} disconnected. Online users: ${Object.keys(onlineUsers).length}`);
      // Broadcast the user's offline status to others
      socket.broadcast.emit('user offline', userId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 