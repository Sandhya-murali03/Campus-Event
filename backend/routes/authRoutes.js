const express = require('express');
const router = express.Router();

// Import controller safely
const authController = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');

// 🔍 Debug (remove later)
console.log("Auth Controller:", authController);

// Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;