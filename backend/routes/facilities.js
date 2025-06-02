const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const auth = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Get all facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find().sort({ createdAt: -1 });
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a facility (admin only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, location, type, icon } = req.body;
    const images = [];

    // Upload images to Cloudinary if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'facilities',
          resource_type: 'auto'
        });
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }

    const facility = new Facility({
      name,
      description,
      location,
      type,
      icon,
      images
    });

    const savedFacility = await facility.save();
    res.status(201).json(savedFacility);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a facility (admin only)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, location, type, icon, keepImages } = req.body;
    const facility = await Facility.findById(req.params.id);
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Handle images
    let images = [];
    if (keepImages) {
      const keepPublicIds = JSON.parse(keepImages);
      images = facility.images.filter(img => keepPublicIds.includes(img.public_id));
    }

    // Upload new images
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'facilities',
          resource_type: 'auto'
        });
        images.push({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    }

    // Delete removed images from Cloudinary
    const removedImages = facility.images.filter(img => !images.some(newImg => newImg.public_id === img.public_id));
    for (const img of removedImages) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    facility.name = name;
    facility.description = description;
    facility.location = location;
    facility.type = type;
    facility.icon = icon;
    facility.images = images;

    const updatedFacility = await facility.save();
    res.json(updatedFacility);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a facility (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Delete images from Cloudinary
    for (const img of facility.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await facility.deleteOne();
    res.json({ message: 'Facility deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 