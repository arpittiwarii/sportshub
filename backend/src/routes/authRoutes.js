const express = require('express');
const router = express.Router();
const { loginController, registerController } = require('../controllers/authController');
const { validate } = require('../middleware/validate')
const { registerSchema, loginSchema } = require('../schemas/user.schema')

// Public route for unified login
router.post('/login', validate(loginSchema), loginController);
router.post('/register', validate(registerSchema), registerController);

// router.post('/login', loginController);
// router.post('/register', registerController);

module.exports = router;
