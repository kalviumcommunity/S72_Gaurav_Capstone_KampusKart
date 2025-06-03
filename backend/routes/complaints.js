const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
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
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'complaints' },
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

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 9 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const totalItems = await Complaint.countDocuments(query);
    const totalPages = Math.ceil(totalItems / parsedLimit);

    const complaints = await Complaint.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    res.json({ complaints, totalItems, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  const { title, description, category, priority, department } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  try {
    const images = req.files && req.files.length > 0 ? await uploadImages(req.files) : [];
    const complaint = new Complaint({
      user: req.user._id,
      title,
      description,
      images,
      category,
      priority,
      department,
    });

    const createdComplaint = await complaint.save();
    await createdComplaint.populate('user', 'name email');
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a complaint (only by the creator)
// @route   PUT /api/complaints/:id
// @access  Private
router.put('/:id', protect, upload.array('images', 5), async (req, res) => {
  const { title, description, status, category, priority, department, keepImages } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Ensure the logged-in user is the creator of the complaint
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this complaint.' });
    }

    complaint.title = title || complaint.title;
    complaint.description = description || complaint.description;
    complaint.status = status || complaint.status; // Allow updating status if needed

    // Update new fields if provided
    if (category) complaint.category = category;
    if (priority) complaint.priority = priority;
    if (department) complaint.department = department;

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
    if (Array.isArray(complaint.images)) {
      for (const img of complaint.images) {
        if (!keepPublicIds.includes(img.public_id)) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
          } catch (err) {
            // Ignore errors
          }
        }
      }
    }
    // Only keep images whose public_id is in keepPublicIds, and preserve order
    let keptImages = [];
    if (Array.isArray(complaint.images)) {
      keptImages = keepPublicIds
        .map(pid => complaint.images.find(img => img.public_id === pid))
        .filter(Boolean);
    }
    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      const newImages = await uploadImages(req.files);
      keptImages = [...keptImages, ...newImages];
    }
    complaint.images = keptImages;

    const updatedComplaint = await complaint.save();
    await updatedComplaint.populate('user', 'name email');
    res.json(updatedComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a complaint (only by the creator)
// @route   DELETE /api/complaints/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Ensure the logged-in user is the creator of the complaint
    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this complaint.' });
    }

    // Delete all images from Cloudinary
    if (Array.isArray(complaint.images)) {
      for (const img of complaint.images) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (err) {
          // Ignore errors
        }
      }
    }

    await complaint.deleteOne();
    res.json({ message: 'Complaint removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 