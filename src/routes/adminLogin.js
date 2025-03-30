const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// JWT Secret (Use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_admin_jwt_secret';

/**
 * Admin login endpoint
 * @route POST /api/admin/login
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {object} Success message, admin info, and JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      admin: {
        id: admin._id,
        email: admin.email
      },
      token,
      expiresIn: 86400 // 24 hours in seconds
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

module.exports = router;
