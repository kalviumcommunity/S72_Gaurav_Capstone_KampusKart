const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming',
  },
  image: {
    public_id: { type: String },
    url: { type: String },
  },
  registerUrl: { type: String },
  operatingHours: { type: String },
  contactInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  mapLocation: {
    building: { type: String },
    floor: { type: String },
    room: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Event', eventSchema); 