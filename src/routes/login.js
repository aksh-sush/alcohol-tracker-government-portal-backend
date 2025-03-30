// src/routes/login.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT Secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'rec';

/**
 * User login endpoint
 * @route POST /api/login
 * @param {string} mobileNumber - User's mobile number
 * @param {string} mpin - User's MPIN
 * @returns {object} Success message and user info or error
 */
router.post('/', async (req, res) => {
  try {
    const { mobileNumber, mpin } = req.body;
    
    // Validate required fields
    if (!mobileNumber || !mpin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number and MPIN are required' 
      });
    }
    
    // Find user by mobile number
    const user = await User.findOne({ mobileNumber });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid mobile number or MPIN' 
      });
    }
    
    // Verify MPIN
    const isMatch = await user.compareMpin(mpin);
    const isActive = user.isactive;
    if (!isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'User account is inactive' 
      });
    }
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid mobile number or MPIN' 
      });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, mobileNumber: user.mobileNumber },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        mobileNumber: user.mobileNumber
      },
      token,
      expiresIn: 86400 // 24 hours in seconds
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

module.exports = router;