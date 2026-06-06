const Payment = require('../models/Payment');
const User = require('../models/User');
const { uploadBufferToCloudinary } = require('../services/cloudinaryUpload');

// @desc    Get all payments (Admin)
// @route   GET /api/payments
// @access  Private (Admin)
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('athleteId', 'name email status sport contact age schoolName afiId profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get athlete's own payments
// @route   GET /api/payments/my-payments
// @access  Private (Athlete)
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ athleteId: req.user._id }).sort({ year: -1, month: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate monthly payments for all approved athletes (Admin)
// @route   POST /api/payments/generate
// @access  Private (Admin)
const generateMonthlyPayments = async (req, res) => {
  try {
    const { month, year, amount } = req.body;
    
    if (!month || !year || !amount) {
      return res.status(400).json({ message: 'Month, year, and amount are required' });
    }

    const athletes = await User.find({ role: 'athlete', status: 'approved' });
    let createdCount = 0;

    for (const athlete of athletes) {
      // Check if payment already exists for this month/year for the athlete
      const exists = await Payment.findOne({ athleteId: athlete._id, month, year });
      if (!exists) {
        await Payment.create({
          athleteId: athlete._id,
          month,
          year,
          amount
        });
        createdCount++;
      }
    }

    res.status(200).json({ message: `Successfully generated ${createdCount} payment records for ${month} ${year}` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload payment proof
// @route   PUT /api/payments/:id/upload
// @access  Private (Athlete)
const uploadPaymentProof = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    if (payment.athleteId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this record' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const folder = `sports-hub/payments/${payment._id.toString()}`;
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder,
      publicId: 'screenshot',
    });

    payment.screenshot = result.secure_url;
    payment.status = 'pending'; // reset status if they re-upload
    payment.submittedAt = Date.now();

    const updatedPayment = await payment.save();
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify payment (Approve/Reject)
// @route   PUT /api/payments/:id/verify
// @access  Private (Admin)
const verifyPayment = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    payment.status = status;
    payment.verifiedAt = Date.now();

    const updatedPayment = await payment.save();
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllPayments,
  getMyPayments,
  generateMonthlyPayments,
  uploadPaymentProof,
  verifyPayment
};
