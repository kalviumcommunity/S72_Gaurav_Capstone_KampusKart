const mongoose = require('mongoose');

const statusUpdateSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    required: true
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['Academic', 'Administrative', 'Facilities', 'IT', 'Security', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  department: {
    type: String,
    enum: ['Academic Affairs', 'Administration', 'Facilities Management', 'IT Services', 'Security', 'Student Services'],
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedResolutionTime: {
    type: Date
  },
  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    }
  ],
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  statusHistory: [statusUpdateSchema],
  stayAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
});

// Update lastUpdated timestamp before saving
complaintSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Add indexes for frequently queried fields
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ department: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ user: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ isDeleted: 1 });
// Compound indexes for common queries
complaintSchema.index({ status: 1, category: 1 });
complaintSchema.index({ isDeleted: 1, createdAt: -1 });
complaintSchema.index({ department: 1, status: 1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint; 