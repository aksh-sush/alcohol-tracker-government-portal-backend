const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * User registration endpoint
 * @route POST /api/register
 * @param {string} mobileNumber - User's 10-digit mobile number
 * @param {string} mpin - User's 4-digit MPIN
 * @param {string} name - User's full name
 * @param {string} aadharnumber - 12-digit Aadhar number
 * @param {string} address - User's address
 * @param {boolean} isactive - Whether the user is active
 * @param {number} totalbottles - Total bottles assigned
 * @param {number} remainingbottles - Remaining bottles
 * @returns {object} Success message or error
 */
router.post('/', async (req, res) => {
  try {
    const { mobileNumber, mpin, name, aadharnumber, address, isactive, totalbottles, remainingbottles } = req.body;
    
    // Validate required fields
    if (!mobileNumber || !mpin || !name || !aadharnumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number, MPIN, name, and Aadhar number are required' 
      });
    }
    
    // Validate mobile number format (10 digits)
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number must be 10 digits' 
      });
    }
    
    // Validate MPIN format (4 digits)
    if (!/^\d{4}$/.test(mpin)) {
      return res.status(400).json({ 
        success: false, 
        message: 'MPIN must be 4 digits' 
      });
    }

    // Validate Aadhar number (12 digits)
    if (!/^\d{12}$/.test(aadharnumber)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aadhar number must be 12 digits' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this mobile number already exists' 
      });
    }
    
    // Calculate expiry date (3 months from today)
    const expirydate = new Date();
    expirydate.setMonth(expirydate.getMonth() + 3);

    // Create new user
    const newUser = new User({
      mobileNumber,
      mpin,
      name,
      expirydate,
      aadharnumber,
      address,
      isactive,
      totalbottles,
      remainingbottles
    });

    await newUser.save();
    
    // Return success response
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        mobileNumber: newUser.mobileNumber,
        name: newUser.name,
        expirydate: newUser.expirydate,
        createdAt: newUser.createdAt
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

module.exports = router;
