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
  imageEmbedding: {
    type: [Number],
    default: undefined,
  },
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
  // Soft delete and notification fields
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  expirationNotified: {
    type: Boolean,
    default: false,
  },
});

// Add indexes for query optimization
LostFoundItemSchema.index({ createdAt: 1 });
LostFoundItemSchema.index({ resolved: 1 });
LostFoundItemSchema.index({ resolvedAt: 1 });
LostFoundItemSchema.index({ isDeleted: 1 });
LostFoundItemSchema.index({ type: 1 });
LostFoundItemSchema.index({ date: -1 });
LostFoundItemSchema.index({ user: 1 });
// Compound indexes for common queries
LostFoundItemSchema.index({ type: 1, resolved: 1, isDeleted: 1 });
LostFoundItemSchema.index({ isDeleted: 1, createdAt: -1 });
// Text index for search functionality
LostFoundItemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('LostFoundItem', LostFoundItemSchema); 