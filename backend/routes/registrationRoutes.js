const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Student registration routes
router.post('/:eventId', authorize('student'), registerForEvent);
router.delete('/:eventId', authorize('student'), cancelRegistration);
router.get('/my-registrations', authorize('student'), getMyRegistrations);

module.exports = router;
