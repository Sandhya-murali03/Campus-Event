const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generateParticipantsExcel } = require('../utils/excelGenerator');
const fs = require('fs');
const path = require('path');

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer only)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      venue,
      eventDate,
      lastRegistrationDate,
      maxParticipants,
      category
    } = req.body;

    // Validate dates
    const eventDateObj = new Date(eventDate);
    const lastRegDateObj = new Date(lastRegistrationDate);
    const now = new Date();

    if (eventDateObj <= now) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      });
    }

    if (lastRegDateObj >= eventDateObj) {
      return res.status(400).json({
        success: false,
        message: 'Last registration date must be before event date'
      });
    }

    if (lastRegDateObj <= now) {
      return res.status(400).json({
        success: false,
        message: 'Last registration date must be in the future'
      });
    }

    const event = await Event.create({
      title,
      description,
      venue,
      eventDate,
      lastRegistrationDate,
      maxParticipants,
      category,
      createdBy: req.user._id,
      image: req.file ? req.file.path : null
    });

    // Notify committee members
    const committeeMembers = await User.find({ role: 'committee' });
    const notifications = committeeMembers.map(member => ({
      user: member._id,
      message: `New event "${title}" submitted for review by ${req.user.name}`,
      event: event._id,
      type: 'general'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully and submitted for approval',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating event',
      error: error.message
    });
  }
};

// @desc    Get all events (filtered by role)
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    let query = {};

    // Students can only see approved events
    if (req.user.role === 'student') {
      query.status = 'Approved';
    }
    // Organizers can see their own events
    else if (req.user.role === 'organizer') {
      query.createdBy = req.user._id;
    }
    // Committee and Principal can see all events

    const events = await Event.find(query)
      .populate('createdBy', 'name email department')
      .sort({ createdAt: -1 });

    // For students, also include registration status
    if (req.user.role === 'student') {
      const eventsWithRegistration = await Promise.all(
        events.map(async (event) => {
          const registration = await Registration.findOne({
            event: event._id,
            user: req.user._id
          });

          const registrationCount = await Registration.countDocuments({
            event: event._id,
            status: 'registered'
          });

          return {
            ...event.toObject(),
            isRegistered: !!registration,
            registrationCount
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: eventsWithRegistration.length,
        events: eventsWithRegistration
      });
    }

    // For other roles, include participant counts
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const registrationCount = await Registration.countDocuments({
          event: event._id,
          status: 'registered'
        });

        return {
          ...event.toObject(),
          registrationCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithCounts.length,
      events: eventsWithCounts
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events',
      error: error.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email department')
      .populate('committeeApprovedBy', 'name')
      .populate('principalApprovedBy', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'student' && event.status !== 'Approved') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this event'
      });
    }

    if (req.user.role === 'organizer' && event.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this event'
      });
    }

    // Get registration info
    const registrationCount = await Registration.countDocuments({
      event: event._id,
      status: 'registered'
    });

    let isRegistered = false;
    if (req.user.role === 'student') {
      const registration = await Registration.findOne({
        event: event._id,
        user: req.user._id
      });
      isRegistered = !!registration;
    }

    res.status(200).json({
      success: true,
      event: {
        ...event.toObject(),
        registrationCount,
        isRegistered
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event',
      error: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer - only own events, before approval)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own events'
      });
    }

    // Prevent updates after committee approval
    if (event.status !== 'Pending' && event.status !== 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update event after it has been approved'
      });
    }

    // Update fields
    const allowedUpdates = [
      'title',
      'description',
      'venue',
      'eventDate',
      'lastRegistrationDate',
      'maxParticipants',
      'category'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    // Update image if provided
    if (req.file) {
      // Delete old image if exists
      if (event.image && fs.existsSync(event.image)) {
        fs.unlinkSync(event.image);
      }
      event.image = req.file.path;
    }

    // Reset status to Pending if it was rejected
    if (event.status === 'Rejected') {
      event.status = 'Pending';
      event.rejectionReason = null;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event',
      error: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer - only own events, before approval)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own events'
      });
    }

    // Prevent deletion after approval
    if (event.status === 'Approved' || event.status === 'CommitteeApproved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event after it has been approved'
      });
    }

    // Delete associated files
    if (event.image && fs.existsSync(event.image)) {
      fs.unlinkSync(event.image);
    }
    if (event.eventPdf && fs.existsSync(event.eventPdf)) {
      fs.unlinkSync(event.eventPdf);
    }

    await Event.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ event: req.params.id });
    await Notification.deleteMany({ event: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event',
      error: error.message
    });
  }
};

// @desc    Committee approve event
// @route   PUT /api/events/:id/committee-approve
// @access  Private (Committee only)
exports.committeeApprove = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Event is not in pending status'
      });
    }

    event.status = 'CommitteeApproved';
    event.committeeApprovedBy = req.user._id;
    event.committeeApprovedAt = Date.now();
    await event.save();

    // Notify organizer
    await Notification.create({
      user: event.createdBy._id,
      message: `Your event "${event.title}" has been approved by the committee and forwarded to the Principal`,
      event: event._id,
      type: 'general'
    });

    // Notify principal
    const principals = await User.find({ role: 'principal' });
    const principalNotifications = principals.map(principal => ({
      user: principal._id,
      message: `Event "${event.title}" has been approved by committee and is awaiting your approval`,
      event: event._id,
      type: 'general'
    }));

    if (principalNotifications.length > 0) {
      await Notification.insertMany(principalNotifications);
    }

    res.status(200).json({
      success: true,
      message: 'Event approved by committee and forwarded to Principal',
      event
    });
  } catch (error) {
    console.error('Committee approve error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving event',
      error: error.message
    });
  }
};

// @desc    Principal approve event (FINAL APPROVAL)
// @route   PUT /api/events/:id/principal-approve
// @access  Private (Principal only)
exports.principalApprove = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.status !== 'CommitteeApproved') {
      return res.status(400).json({
        success: false,
        message: 'Event must be approved by committee first'
      });
    }

    event.status = 'Approved';
    event.principalApprovedBy = req.user._id;
    event.principalApprovedAt = Date.now();
    await event.save();

    // Notify organizer
    await Notification.create({
      user: event.createdBy._id,
      message: `Great news! Your event "${event.title}" has been approved by the Principal. It is now visible to all students.`,
      event: event._id,
      type: 'event_approved'
    });

    // Notify ALL students
    const students = await User.find({ role: 'student' });
    const studentNotifications = students.map(student => ({
      user: student._id,
      message: `New event "${event.title}" is now open for registration! Register before ${new Date(event.lastRegistrationDate).toLocaleDateString()}`,
      event: event._id,
      type: 'event_approved'
    }));

    if (studentNotifications.length > 0) {
      await Notification.insertMany(studentNotifications);
    }

    res.status(200).json({
      success: true,
      message: 'Event approved by Principal. Event is now live and visible to all students!',
      event
    });
  } catch (error) {
    console.error('Principal approve error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving event',
      error: error.message
    });
  }
};

// @desc    Reject event
// @route   PUT /api/events/:id/reject
// @access  Private (Committee or Principal)
exports.rejectEvent = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rejection reason'
      });
    }

    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.status = 'Rejected';
    event.rejectionReason = reason;
    await event.save();

    // Notify organizer
    await Notification.create({
      user: event.createdBy._id,
      message: `Your event "${event.title}" has been rejected. Reason: ${reason}`,
      event: event._id,
      type: 'event_rejected'
    });

    res.status(200).json({
      success: true,
      message: 'Event rejected',
      event
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting event',
      error: error.message
    });
  }
};

// @desc    Upload event files (PDF, participants list)
// @route   POST /api/events/:id/upload-files
// @access  Private (Organizer - only own events)
exports.uploadEventFiles = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload files to your own events'
      });
    }

    const { fileType } = req.body;

    if (fileType === 'pdf' && req.file) {
      // Delete old PDF if exists
      if (event.eventPdf && fs.existsSync(event.eventPdf)) {
        fs.unlinkSync(event.eventPdf);
      }
      event.eventPdf = req.file.path;
    } else if (fileType === 'participantsList' && req.file) {
      // Delete old list if exists
      if (event.participantsList && fs.existsSync(event.participantsList)) {
        fs.unlinkSync(event.participantsList);
      }
      event.participantsList = req.file.path;
    }

    await event.save();

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      event
    });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading files',
      error: error.message
    });
  }
};

// @desc    Get event participants
// @route   GET /api/events/:id/participants
// @access  Private
exports.getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Only approved events or organizers can see participants
    if (event.status !== 'Approved' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view participants'
      });
    }

    const registrations = await Registration.find({
      event: req.params.id,
      status: 'registered'
    })
      .populate('user', 'name email department year')
      .sort({ registeredAt: -1 });

    const participants = registrations.map(reg => ({
      id: reg.user._id,
      name: reg.user.name,
      email: reg.user.email,
      department: reg.user.department,
      year: reg.user.year,
      registeredAt: reg.registeredAt
    }));

    res.status(200).json({
      success: true,
      count: participants.length,
      participants
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching participants',
      error: error.message
    });
  }
};

// @desc    Download participants Excel
// @route   GET /api/events/:id/download-participants
// @access  Private (Organizer, Committee, Principal)
exports.downloadParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check permissions
    if (
      req.user.role !== 'committee' &&
      req.user.role !== 'principal' &&
      event.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to download participants list'
      });
    }

    const registrations = await Registration.find({
      event: req.params.id,
      status: 'registered'
    })
      .populate('user', 'name email department year')
      .sort({ registeredAt: 1 });

    const participants = registrations.map(reg => ({
      name: reg.user.name,
      email: reg.user.email,
      department: reg.user.department,
      year: reg.user.year,
      registeredAt: reg.registeredAt
    }));

    const result = await generateParticipantsExcel(event.title, participants);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Error generating Excel file',
        error: result.error
      });
    }

    res.download(result.filepath, result.filename, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Optionally delete file after download
      // fs.unlinkSync(result.filepath);
    });
  } catch (error) {
    console.error('Download participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while downloading participants',
      error: error.message
    });
  }
};

module.exports = exports;
