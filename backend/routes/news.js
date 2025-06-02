const express = require('express');
const router = express.Router();
const News = require('../models/News');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to upload images to Cloudinary
const uploadImages = async (files) => {
  const uploadPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      if (!file.mimetype.startsWith('image/')) {
        return reject(new Error('Only image files are allowed'));
      }
      if (file.size > 5 * 1024 * 1024) {
        return reject(new Error('Image size should be less than 5MB'));
      }
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'news',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({ public_id: result.public_id, url: result.secure_url });
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  });
  return Promise.all(uploadPromises);
};

// GET all news
router.get('/', async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new news (admin only)
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
    return res.status(403).json({ message: 'Not authorized to add news.' });
  }
  const { title, description, date, category } = req.body;
  if (!title || !description || !date || !category) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const images = req.files && req.files.length > 0 ? await uploadImages(req.files) : [];
    const news = new News({
      title,
      description,
      date,
      category,
      images,
    });
    const savedNews = await news.save();
    res.status(201).json(savedNews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a news item (admin only)
router.put('/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
  if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
    return res.status(403).json({ message: 'Only admin can edit news.' });
  }
  const { title, description, date, category, keepImages } = req.body;
  if (!title || !description || !date || !category) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News not found.' });
    news.title = title;
    news.description = description;
    news.date = date;
    news.category = category;
    // Handle image deletion and reordering
    let keepPublicIds = [];
    if (keepImages) {
      try {
        keepPublicIds = JSON.parse(keepImages);
      } catch (e) {
        keepPublicIds = [];
      }
    }
    // Remove images not in keepPublicIds from Cloudinary
    if (Array.isArray(news.images)) {
      for (const img of news.images) {
        if (!keepPublicIds.includes(img.public_id)) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
          } catch (err) {}
        }
      }
    }
    // Only keep images whose public_id is in keepPublicIds, and preserve order
    let keptImages = [];
    if (Array.isArray(news.images)) {
      keptImages = keepPublicIds
        .map(pid => news.images.find(img => img.public_id === pid))
        .filter(Boolean);
    }
    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      const newImages = await uploadImages(req.files);
      keptImages = [...keptImages, ...newImages];
    }
    news.images = keptImages;
    const updated = await news.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a news item (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
    return res.status(403).json({ message: 'Only admin can delete news.' });
  }
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'News not found.' });
    res.json({ message: 'News deleted.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 