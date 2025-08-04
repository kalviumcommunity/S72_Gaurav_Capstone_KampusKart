const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { validateSignup, validateLogin, sanitizeInput } = require('../middleware/validation');

// Create Nodemailer transporter with better error handling
let transporter;
try {
  // Check if email configuration is available
  if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS // Your email password or app-specific password
      }
    });
    console.log('Email transporter configured successfully');
  } else {
    console.warn('Email configuration missing. Forgot password functionality will be limited.');
    transporter = null;
  }
} catch (error) {
  console.error('Error configuring email transporter:', error);
  transporter = null;
}

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 50 requests per windowMs (very generous)
  message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 125, // limit each IP to 25 requests per windowMs (very generous)
  message: { message: 'Too many signup attempts, please try again after an hour' }
});

// Google OAuth routes
router.get('/google',
  (req, res, next) => {
    console.log('Initiating Google OAuth login');
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      prompt: 'select_account'
    })(req, res, next);
  }
);

router.get('/google/callback',
  (req, res, next) => {
    console.log('Received Google OAuth callback');
    passport.authenticate('google', { 
      session: false,
      failureRedirect: '/login'
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('Processing Google OAuth callback');
      // Validate JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not configured');
        return res.redirect('/login?error=server_configuration');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Determine the frontend URL based on environment
      const frontendUrl = process.env.NODE_ENV === 'production'
        ? 'https://kampuskart.netlify.app'
        : 'http://localhost:3000';

      console.log('Redirecting to frontend:', frontendUrl);
      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/auth/google/callback?token=${token}`);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect('/login?error=authentication_failed');
    }
  }
);

// Signup route
router.post('/signup', signupLimiter, sanitizeInput, validateSignup, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with normalized email
    const user = new User({
      email: email.toLowerCase(),
      password,
      name: name.trim()
    });

    await user.save();

    // Validate JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Check if user is admin based on environment configuration
    const adminEmails = process.env.ADMIN_EMAILS ? 
      process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) : 
      [];
    const isAdmin = adminEmails.includes(user.email);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
});

// Login route
router.post('/login', loginLimiter, sanitizeInput, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with normalized email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Check if user is admin based on environment configuration
    const adminEmails = process.env.ADMIN_EMAILS ? 
      process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) : 
      [];
    const isAdmin = adminEmails.includes(user.email);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in', 
      error: error.message 
    });
  }
});

// Request Password Reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration time (e.g., 15 minutes)
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Email options
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER, // Your email address
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for 15 minutes.`
    };

    // Send email if transporter is configured
    if (transporter) {
      try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to your email' });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        res.status(500).json({ message: 'Error sending email. Please try again later.' });
      }
    } else {
      // For development/testing, return the OTP in the response
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      res.status(200).json({ 
        message: 'OTP generated successfully (email service not configured)',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        note: 'In production, this OTP would be sent via email'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Reset Password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP is valid and not expired
    const now = Date.now();
    if (!user.resetPasswordOTP || user.resetPasswordExpires < now) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Secure OTP comparison to mitigate timing attacks
    const isOtpValid = crypto.timingSafeEqual(Buffer.from(user.resetPasswordOTP), Buffer.from(otp));
    if (!isOtpValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password
    // Password hashing is handled by the pre-'save' hook in the User model
    user.password = newPassword;
    user.resetPasswordOTP = undefined; // Clear OTP fields after reset
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// Token refresh route
router.post('/refresh', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Validate JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Verify the current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Generate new token
    const newToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router; 