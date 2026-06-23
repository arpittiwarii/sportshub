const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();
require('./env')

const { connectDB } = require('./config/db');
const { routes } = require('./routes/index');
require('./models/index')
const errorHandler = require('./middleware/errorHandler');
const paymentReminderJob = require('./jobs/paymentReminder')


const app = express();
const PORT = process.env.PORT || 8000;

//cron jobs schedule to send payment reminder
paymentReminderJob();

// Middleware
const corsOptions = {
  origin: process.env.NODE_TYPE === 'production' ? process.env.FRONTEND_URL.split(',') : 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api', routes)


// Centralized error handler (uploads, multer validation, etc.)
app.use(errorHandler);

Promise.resolve()
  .then(() => connectDB())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.log('internal error : something went wrong\n', err)
  })


