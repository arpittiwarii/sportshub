const express = require('express');
const router = express.Router();
const { createOtpController, verifyOtpController } = require('../controllers/otp.controller.js');
const { validate } = require('../middleware/validate');
const { sendOtpSchema, verifyOtpSchema } = require('../schemas/otp.schema');

router.post('/send', validate(sendOtpSchema), createOtpController);
router.post('/verify', validate(verifyOtpSchema), verifyOtpController);

module.exports = router;
