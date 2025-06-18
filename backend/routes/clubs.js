const express = require('express');
const router = express.Router();
const ClubRecruitment = require('../models/ClubRecruitment');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all club recruitments
router.get('/', async (req, res) => {
  try {
    const clubs = await ClubRecruitment.find().sort({ startDate: -1 });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new club recruitment (admin only)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
    return res.status(403).json({ message: 'Not authorized to add club recruitments.' });
  }

  const { title, description, clubName, startDate, endDate, formUrl, contactInfo, status } = req.body;
  if (!title || !description || !clubName || !startDate || !endDate || !formUrl) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  let image = undefined;
  if (req.file) {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'clubs' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
          }
          image = { public_id: result.public_id, url: result.secure_url };
          const club = new ClubRecruitment({
            title,
            description,
            clubName,
            startDate,
            endDate,
            formUrl,
            image,
            contactInfo: contactInfo ? JSON.parse(contactInfo) : undefined,
            status: status || 'Open',
          });
          const savedClub = await club.save();
          res.status(201).json(savedClub);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      return;
    } catch (err) {
      return res.status(500).json({ message: 'Image upload error', error: err.message });
    }
  }

  try {
    const club = new ClubRecruitment({
      title,
      description,
      clubName,
      startDate,
      endDate,
      formUrl,
      image,
      contactInfo: contactInfo ? JSON.parse(contactInfo) : undefined,
      status: status || 'Open',
    });
    const savedClub = await club.save();
    res.status(201).json(savedClub);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a club recruitment (admin only)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
    return res.status(403).json({ message: 'Only admin can edit club recruitments.' });
  }
  const { title, description, clubName, startDate, endDate, formUrl, contactInfo, status } = req.body;
  if (!title || !description || !clubName || !startDate || !endDate || !formUrl || !status) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const club = await ClubRecruitment.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club recruitment not found.' });

    if (req.file) {
      if (club.image && club.image.public_id) {
        try {
          await cloudinary.uploader.destroy(club.image.public_id);
        } catch (err) {
          console.error('Error deleting old club image:', err);
        }
      }
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'clubs' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
          }
          club.image = { public_id: result.public_id, url: result.secure_url };
          club.title = title;
          club.description = description;
          club.clubName = clubName;
          club.startDate = startDate;
          club.endDate = endDate;
          club.formUrl = formUrl;
          club.contactInfo = contactInfo ? JSON.parse(contactInfo) : undefined;
          club.status = status;
          await club.save();
          res.json(club);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      return;
    }

    club.title = title;
    club.description = description;
    club.clubName = clubName;
    club.startDate = startDate;
    club.endDate = endDate;
    club.formUrl = formUrl;
    club.contactInfo = contactInfo ? JSON.parse(contactInfo) : undefined;
    club.status = status;
    await club.save();
    res.json(club);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a club recruitment (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.email !== 'gauravkhandelwal205@gmail.com') {
    return res.status(403).json({ message: 'Only admin can delete club recruitments.' });
  }
  try {
    const deleted = await ClubRecruitment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Club recruitment not found.' });
    res.json({ message: 'Club recruitment deleted.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 