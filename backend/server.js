const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const connectDB = require('./config/db');
const athleteRoutes = require('./routes/athleteRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const blogRoutes = require('./routes/blogRoutes');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
const corsOptions = {
  origin: process.env.NODE_TYPE==='production' ? process.env.FRONTEND_URL.split(',') : 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/athletes', athleteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);

// Centralized error handler (uploads, multer validation, etc.)
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('API Error:', err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  // FileFilter/file validation errors typically come as plain Error objects.
  if (err?.message && err.message.toLowerCase().includes('invalid')) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
