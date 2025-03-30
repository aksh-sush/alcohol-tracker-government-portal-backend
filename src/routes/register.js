const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * User registration endpoint
 */
router.post('/', async (req, res) => {
  try {
    const { 
      name,  // ✅ Fixed from "Name"
      mobileNumber, 
      mpin, // ✅ Added missing mpin field
      dob,  // ✅ Fixed from "dateOfBirth"
      aadharnumber, // ✅ Fixed from "aadharNumber"
      address, 
      isactive, // ✅ Fixed from "isActive"
      totalbottles, // ✅ Fixed from "totalBottles"
      remainingbottles, // ✅ Fixed from "remainingBottles"
      weight 
    } = req.body;

    // ✅ Validate required fields
    if (!name || !mpin || !mobileNumber || !dob || !aadharnumber) {
      return res.status(400).json({
        success: false,
        message: 'Name, MPIN, mobile number, date of birth, and Aadhar number are required'
      });
    }

    // ✅ Validate MPIN (Must be 4-6 digits)
    if (!/^\d{4,6}$/.test(mpin)) {
      return res.status(400).json({ success: false, message: 'MPIN must be 4 to 6 digits' });
    }

    // ✅ Validate mobile number format
    if (!/^\d{10}$/.test(mobileNumber)) {
      return res.status(400).json({ success: false, message: 'Mobile number must be 10 digits' });
    }

    // ✅ Validate Aadhar number format
    if (!/^\d{12}$/.test(aadharnumber)) {
      return res.status(400).json({ success: false, message: 'Aadhar number must be 12 digits' });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User with this mobile number already exists' });
    }

    // ✅ Calculate expiry date (3 months from today)
    const expirydate = new Date();
    expirydate.setMonth(expirydate.getMonth() + 3);

    // ✅ Create new user
    const newUser = new User({
      name,
      mobileNumber,
      mpin,  // Now included & will be hashed in User.js
      dob,
      aadharnumber,
      expirydate,
      address,
      isactive,
      totalbottles,
      remainingbottles,
      weight
    });

    await newUser.save();

    // ✅ Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        mobileNumber: newUser.mobileNumber,
        expirydate: newUser.expirydate,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

module.exports = router;
