const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cloudinary configuration (ensure you have CLOUDINARY_URL in your .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware
    // Select all fields except password and reset token fields
    const user = await User.findById(req.user.id).select('-password -resetPasswordOTP -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error', error: err.message }); // Send JSON error response
  }
});

// @route   PUT /api/profile
// @desc    Update user profile and optionally upload profile picture
// @access  Private
router.put('/', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  // Remove address from destructuring, it's no longer in the model
  const { name, phone, major, yearOfStudy, gender, dateOfBirth, program } = req.body;

  // Build profile object
  const profileFields = {};
  // Add fields from req.body if they exist and are not undefined
  if (name !== undefined) profileFields.name = name; // Allow clearing name
  if (phone !== undefined) profileFields.phone = phone; // Allow saving empty string to clear phone
  // Removed address from profileFields
  if (major !== undefined) profileFields.major = major; // Allow saving empty string
  if (yearOfStudy !== undefined) profileFields.yearOfStudy = yearOfStudy; // Allow saving empty string (now for year interval)
  if (gender !== undefined) profileFields.gender = gender;
  if (dateOfBirth !== undefined) profileFields.dateOfBirth = dateOfBirth === '' ? null : dateOfBirth; // Allow clearing, save as null if empty string
  if (program !== undefined) profileFields.program = program; // Allow saving empty string
  // Add other fields to update here

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle profile picture upload if a file is provided
    if (req.file) {
      // Delete old profile picture from Cloudinary if it exists
      if (user.profilePicture && user.profilePicture.public_id) {
        try {
           await cloudinary.uploader.destroy(user.profilePicture.public_id);
        } catch (deleteError) {
           console.error('Error deleting old Cloudinary image:', deleteError);
           // Continue with the upload even if old deletion fails
        }
      }

      // Upload new image to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'profile_pictures' }, // Optional: specify a folder
        async (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            // If upload fails, respond with error and return to prevent further execution
            return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
          }

          // Update user document with new profile picture info
          user.profilePicture = {
            url: result.secure_url,
            public_id: result.public_id,
          };

          // Save the user with the updated profile picture field and other profile fields
          // Merge profileFields into user object before saving
          Object.assign(user, profileFields);
          await user.save();

          // Respond with the updated user data after handling the picture
          const updatedUser = await User.findById(req.user.id).select('-password -resetPasswordOTP -resetPasswordExpires');
          res.json(updatedUser);
        }
      );

      // Stream the buffer to Cloudinary
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } else {
      // If no file is provided, just update the text fields
      // Use findByIdAndUpdate to directly update and get the new document
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: profileFields },
        { new: true, runValidators: true }
      ).select('-password -resetPasswordOTP -resetPasswordExpires');

      res.json(user);
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error', error: err.message }); // Send JSON error response
  }
});

module.exports = router; 