const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  committeeApprove,
  principalApprove,
  rejectEvent,
  uploadEventFiles,
  getEventParticipants,
  downloadParticipants
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage, uploadPdf } = require('../utils/fileUpload');

// Public routes (none for events - all require authentication)

// Protected routes
router.use(protect);

// General event routes
router.get('/', getEvents);
router.get('/:id', getEvent);
router.get('/:id/participants', getEventParticipants);

// Organizer routes
router.post('/', authorize('organizer'), uploadImage, createEvent);
router.put('/:id', authorize('organizer'), uploadImage, updateEvent);
router.delete('/:id', authorize('organizer'), deleteEvent);
router.post('/:id/upload-files', authorize('organizer'), uploadPdf, uploadEventFiles);
router.get('/:id/download-participants', authorize('organizer', 'committee', 'principal'), downloadParticipants);

// Committee routes
router.put('/:id/committee-approve', authorize('committee'), committeeApprove);
router.put('/:id/reject', authorize('committee', 'principal'), rejectEvent);

// Principal routes
router.put('/:id/principal-approve', authorize('principal'), principalApprove);

module.exports = router;
