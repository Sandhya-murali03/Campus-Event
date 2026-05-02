const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide event description']
  },
  venue: {
    type: String,
    required: [true, 'Please provide event venue']
  },
  eventDate: {
    type: Date,
    required: [true, 'Please provide event date']
  },
  lastRegistrationDate: {
    type: Date,
    required: [true, 'Please provide last registration date']
  },
  status: {
    type: String,
    enum: ['Pending', 'CommitteeApproved', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationClosed: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: null
  },
  participantsList: {
    type: String,
    default: null
  },
  eventPdf: {
    type: String,
    default: null
  },
  maxParticipants: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'],
    default: 'Other'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  committeeApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  committeeApprovedAt: {
    type: Date,
    default: null
  },
  principalApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  principalApprovedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Event', eventSchema);
