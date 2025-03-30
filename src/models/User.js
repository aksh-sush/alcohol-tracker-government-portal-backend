const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  mpin: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  expirydate: {
    type: Date,
    required: true
  },
  aadharnumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid 12-digit Aadhar number!`
    }
  },
  address: {
    type: String
  },
  isactive: {
    type: Boolean,
    default: true
  },
  totalbottles: {
    type: Number,
    default: 0
  },
  remainingbottles: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash MPIN
userSchema.pre('save', async function(next) {
  if (this.isModified('mpin')) {
    this.mpin = await bcrypt.hash(this.mpin, 10);
  }
  next();
});

// Method to compare MPIN
userSchema.methods.compareMpin = async function(candidateMpin) {
  return bcrypt.compare(candidateMpin, this.mpin);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
