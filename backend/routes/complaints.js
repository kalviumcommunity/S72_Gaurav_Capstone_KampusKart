const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
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

    const complaints = await Complaint.find(query).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  try {
    const complaint = new Complaint({
      user: req.user._id,
      title,
      description,
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
router.put('/:id', protect, async (req, res) => {
  const { title, description, status } = req.body;

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

    await complaint.deleteOne();
    res.json({ message: 'Complaint removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 