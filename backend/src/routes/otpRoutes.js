const express = require('express');
const router = express.Router();
const { createOtpController, verifyOtpController } = require('../controllers/otp.controller.js');

router.post('/send', createOtpController);
router.post('/verify', verifyOtpController);

module.exports = router;