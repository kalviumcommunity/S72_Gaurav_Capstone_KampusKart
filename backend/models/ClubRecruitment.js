const mongoose = require('mongoose');

const clubRecruitmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  clubName: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  formUrl: {
    type: String,
    required: true,
  },
  image: {
    public_id: { type: String },
    url: { type: String },
  },
  contactInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ClubRecruitment', clubRecruitmentSchema); 