const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const lostfoundRoutes = require('./routes/lostfound');
const startDeletionCronJob = require('./cron/deleteItems');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/lostfound', lostfoundRoutes);

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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 