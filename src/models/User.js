const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  mobileNumber: {
    type: String,
    required: [true, "Mobile number is required"],
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
    required: [true, "MPIN is required"]
  },
  aadharnumber: {
    type: String,
    required: [true, "Aadhar number is required"],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid 12-digit Aadhar number!`
    }
  },
  expirydate: {
    type: Date,
    required: [true, "Expiry date is required"]
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  isactive: {
    type: Boolean,
    default: false
  },
  totalbottles: {
    type: Number,
    default: 0
  },
  remainingbottles: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  dob: {
    type: Date,
    required: false // Can be optional
  }
}, { timestamps: true }); // Automatically adds createdAt & updatedAt

// **Pre-save Hook to Hash MPIN**
userSchema.pre('save', async function(next) {
  if (this.isModified('mpin')) {
    this.mpin = await bcrypt.hash(this.mpin, 10);
  }
  next();
});

// **Method to Compare MPIN**
userSchema.methods.compareMpin = async function(candidateMpin) {
  return bcrypt.compare(candidateMpin, this.mpin);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
