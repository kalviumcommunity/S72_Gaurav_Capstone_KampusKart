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

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint; 