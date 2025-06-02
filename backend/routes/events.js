const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cloudinary config (reuse from other routes)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new event (admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
    return res.status(403).json({ message: 'Not authorized to add events.' });
  }

  const { title, description, date, location, status, registerUrl } = req.body;

  if (!title || !description || !date || !location) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  let image = undefined;
  if (req.file) {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'events' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
          }
          image = { public_id: result.public_id, url: result.secure_url };
          const event = new Event({
            title,
            description,
            date,
            location,
            status: status || 'Upcoming',
            registerUrl,
            image
          });
          const savedEvent = await event.save();
          res.status(201).json(savedEvent);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      return;
    } catch (err) {
      return res.status(500).json({ message: 'Image upload error', error: err.message });
    }
  }

  try {
    const event = new Event({
      title,
      description,
      date,
      location,
      status: status || 'Upcoming',
      registerUrl,
      image
    });
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an event (admin only)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
    return res.status(403).json({ message: 'Only admin can edit events.' });
  }
  const { title, description, date, location, status, registerUrl } = req.body;
  if (!title || !description || !date || !location || !status) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Handle image replacement if a new file is uploaded
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (event.image && event.image.public_id) {
        try {
          await cloudinary.uploader.destroy(event.image.public_id);
        } catch (err) {
          console.error('Error deleting old event image:', err);
        }
      }
      // Upload new image
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'events' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
          }
          event.image = { public_id: result.public_id, url: result.secure_url };
          event.title = title;
          event.description = description;
          event.date = date;
          event.location = location;
          event.status = status;
          event.registerUrl = registerUrl;
          await event.save();
          res.json(event);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      return;
    }

    // No new image, just update fields
    event.title = title;
    event.description = description;
    event.date = date;
    event.location = location;
    event.status = status;
    event.registerUrl = registerUrl;
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an event (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
    return res.status(403).json({ message: 'Only admin can delete events.' });
  }
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 