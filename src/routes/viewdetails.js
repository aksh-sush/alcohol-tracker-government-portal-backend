const express = require('express');
const router = express.Router();
const User = require('../models/User');
const moment = require("moment"); // Import moment.js for date manipulation

/**
 * View user details by Aadhar number
 * @route GET /api/viewdetails/:cardNumber
 * @param {string} cardNumber - User's Aadhar number (12 digits)
 * @returns {object} User details or error
 */
router.get('/:cardNumber', async (req, res) => {
  try {
    const { cardNumber } = req.params;
    console.error(cardNumber);
    // Validate Aadhar number format (12 digits)
    if (!/^\d{10}$/.test(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number must be 12 digits'
      });
    }

    // Find user by Aadhar number
    const user = await User.findOne({ mobileNumber: cardNumber });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    const getHealthRecommendation = (bottles) => {
      if (bottles <= 2) return "✅ Healthy consumption, no health risks.";
      if (bottles <= 5) return "⚠️ Moderate consumption, keep an eye on intake.";
      if (bottles <= 8) return "⚠️ High consumption, reduce for better health.";
      return "❌ Excessive consumption, high risk of health issues!";
    };
    
    // Return user details (excluding MPIN for security)
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        mobileNumber: user.mobileNumber,
        expirydate: user.expirydate,
        renewaldate: moment(user.expirydate).add(3, "months").format("YYYY-MM-DD"), // Add 3 months
        aadharnumber: user.aadharnumber,
        address: user.address,
        isactive: user.isactive,
        totalbottles: user.totalbottles,
        remainingbottles: user.remainingbottles,
       healthRecommendation: getHealthRecommendation(user.totalbottles),
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user details'
    });
  }
});

module.exports = router;
