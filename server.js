require('dotenv').config(); // Load environment variables
const viewDetailsRouter = require('./src/routes/viewdetails');

const adminLoginRouter = require('./src/routes/adminLogin');

const express = require('express');
const mongoose = require('mongoose');
const registerRouter = require('./src/routes/register');
const loginRouter = require('./src/routes/login');

const app = express();
const PORT = process.env.PORT || 7333;

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
