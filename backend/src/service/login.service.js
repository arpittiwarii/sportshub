const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Seed default admin if missing
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount === 0) {
            await User.create({
                email: 'admin@sportshub.com',
                password: 'password123',
                role: 'admin',
                status: 'approved',
                name: 'Super Admin'
            });
        }

        const user = await User.findOne({ email });

        // User doesn't exist
        if (!user) {
            return res.status(401).json({ message: 'Email not found. Please check and try again.' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Wrong password. Please try again.' });
        }

        // Check approval for athletes
        if (user.role === 'athlete') {
            if (user.status === 'pending') {
                return res.status(403).json({ message: 'Account is pending admin approval. Please wait for approval.' });
            }
            if (user.status === 'rejected') {
                return res.status(403).json({ message: 'Your account has been rejected. Please contact admin.' });
            }
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { loginUser };
