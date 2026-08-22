const express = require('express');
const router = express.Router();
const {
    loginController,
    registerController,
    forgotPasswordController,
    resetPasswordController,
} = require('../controllers/authController');
const { validate } = require('../middleware/validate')
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} = require('../schemas/user.schema')

// Public route for unified login
router.post('/login', validate(loginSchema), loginController);
router.post('/register', validate(registerSchema), registerController);

// Password reset by emailed OTP. Both steps are public by necessity — the user
// cannot authenticate — so both are rate limited in app.js.
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordController);

module.exports = router;
