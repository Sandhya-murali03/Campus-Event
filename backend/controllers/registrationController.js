const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Student only)
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is approved
    if (event.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'This event is not yet approved for registration'
      });
    }

    // Check if registration is closed
    if (event.registrationClosed) {
      return res.status(400).json({
        success: false,
        message: 'Registration for this event has been closed'
      });
    }

    // Check if registration deadline has passed
    if (new Date() > new Date(event.lastRegistrationDate)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      event: eventId,
      user: req.user._id
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check max participants limit
    if (event.maxParticipants) {
      const currentCount = await Registration.countDocuments({
        event: eventId,
        status: 'registered'
      });

      if (currentCount >= event.maxParticipants) {
        return res.status(400).json({
          success: false,
          message: 'Maximum participant limit reached for this event'
        });
      }
    }

    // Create registration
    const registration = await Registration.create({
      event: eventId,
      user: req.user._id
    });

    // Create notification for user
    await Notification.create({
      user: req.user._id,
      message: `You have successfully registered for "${event.title}"`,
      event: eventId,
      type: 'registration_success'
    });

    // Notify event organizer
    await Notification.create({
      user: event.createdBy,
      message: `${req.user.name} has registered for your event "${event.title}"`,
      event: eventId,
      type: 'general'
    });

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the event',
      registration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:eventId
// @access  Private (Student only)
exports.cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registration = await Registration.findOne({
      event: eventId,
      user: req.user._id
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    const event = await Event.findById(eventId);

    // Check if event has already started
    if (new Date() >= new Date(event.eventDate)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration after event has started'
      });
    }

    await Registration.findByIdAndDelete(registration._id);

    // Create notification
    await Notification.create({
      user: req.user._id,
      message: `Your registration for "${event.title}" has been cancelled`,
      event: eventId,
      type: 'general'
    });

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling registration',
      error: error.message
    });
  }
};

// @desc    Get user's registrations
// @route   GET /api/registrations/my-registrations
// @access  Private
exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
      status: 'registered'
    })
      .populate({
        path: 'event',
        populate: {
          path: 'createdBy',
          select: 'name department'
        }
      })
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching registrations',
      error: error.message
    });
  }
};

module.exports = exports;
