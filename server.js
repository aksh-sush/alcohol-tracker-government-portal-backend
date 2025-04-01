require('dotenv').config(); // Load environment variables
const cors = require('cors'); 
const express = require('express');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const registerRouter = require('./src/routes/register');
const loginRouter = require('./src/routes/login');
const viewDetailsRouter = require('./src/routes/viewdetails');
const adminLoginRouter = require('./src/routes/adminLogin');
const app = express();
const PORT = process.env.PORT || 7333;

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from your frontend
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Middleware
app.use(express.json());

// Use authentication routers
app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
app.use('/api/viewdetails', viewDetailsRouter);
app.use('/api/admin', adminLoginRouter);


// 🔹 1. Fetch Inactive Users
app.get("/api/users", async (req, res) => {
  try {
    const { isActive } = req.query;
    const users = await User.find();
    res.json(users);
  
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/users/update-status", async (req, res) => {
  try {
    const { mobileNumber, isactive } = req.body; // Ensure case matches

    // Find and update user based on mobile number
    const user = await User.findOneAndUpdate(
      { mobileNumber },  // Find user by mobile number
      { isactive },       // Update the isActive field
      { new: true }       // Return updated document
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `User ${isactive ? "Activated" : "Deactivated"}`, user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

app.get("/api/dashboard/stats", async (req, res) => {
  try {
    // Fetch counts from the database
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isactive: true });
    const pendingApplications = await User.countDocuments({ isactive: false });

    // Return response
    res.json({
      totalUsers,
      activeUsers,
      pendingApplications
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
