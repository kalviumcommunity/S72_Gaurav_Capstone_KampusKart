const mongoose = require('mongoose');

const LostFoundItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    }
  ],
  resolved: {
    type: Boolean,
    default: false,
  },
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  resolvedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LostFoundItem', LostFoundItemSchema); 