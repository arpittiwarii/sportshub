const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllPayments,
  getMyPayments,
  generateMonthlyPayments,
  uploadPaymentProof,
  verifyPayment
} = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Multer Storage Configuration (memory -> upload to Cloudinary)
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const isAllowed = ALLOWED_MIME_TYPES.has(file.mimetype);
    if (!isAllowed) return cb(new Error('Invalid file type. Only JPG/PNG are allowed.'));
    cb(null, true);
  },
});

// Routes for Athlete
router.get('/my-payments', protect, getMyPayments);
router.put('/:id/upload', protect, restrictTo('athlete'), upload.single('screenshot'), uploadPaymentProof);

// Routes for Admin
router.get('/', protect, restrictTo('admin'), getAllPayments);
router.post('/generate', protect, restrictTo('admin'), generateMonthlyPayments);
router.put('/:id/verify', protect, restrictTo('admin'), verifyPayment);

module.exports = router;
