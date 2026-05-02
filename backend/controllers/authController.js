const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ✅ Register
const register = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { name, email, password, role, department, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password required"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const userRole = role || 'student';

    if (userRole === 'student' && !year) {
      return res.status(400).json({
        success: false,
        message: "Year required for students"
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      department,
      year: userRole === 'student' ? year : undefined
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email & password required"
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const unreadCount = await Notification.countDocuments({
      user: user._id,
      isRead: false
    });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user,
      unreadNotifications: unreadCount
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GetMe
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.log("GETME ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ FINAL EXPORT (IMPORTANT)
module.exports = {
  register,
  login,
  getMe
};