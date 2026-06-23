const { findUserByEmail, createUser, countAdminUsers } = require('../repositories/User.repository');
const { NotFoundError } = require('../Error/NotFoundError');
const { Authentication } = require('../Error/AuthenticationError');
const { ValidationError } = require('../Error/ValidationError');
const { generateToken } = require('./token.service');
const { InternalServerError } = require('../Error/InternalServerError');
const bcrypt = require('bcryptjs');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async ({ email, password }) => {
    try {
        // Seed default admin if missing
        const adminCount = await countAdminUsers();
        console.log(adminCount)
        if (!adminCount || adminCount <= 0) {
            const user = await createUser({
                email: 'admin@sportshub.com',
                password: await bcrypt.hash('password123', Number(process.env.SALT_ROUND)),
                role: 'ADMIN',
                age: 21,
                sports: 'Shot Put',
                status: 'APPROVED',
                contact: "8765432198",
                name: 'Super Admin'
            });
        }


        // User doesn't exist
        const user = await findUserByEmail(email);
        if (!user) {
            throw new NotFoundError('Email not found. Please check and try again.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Authentication('Wrong password. Please try again.');
        }

        // Check approval for athletes
        if (user.role === 'ATHLETE') {
            if (user.status === 'PENDING') {
                throw new ValidationError('Account is pending admin approval. Please wait for approval.');
            }
            if (user.status === 'REJECTED') {
                throw new ValidationError('Your account has been rejected. Please contact admin.');
            }
        }
        const token = await generateToken(user);
        if (!token)
            throw new InternalServerError('token not generated')

        return ({
            ...token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            }
        });
    } catch (error) {
        if (error && error.isOperational) {
            throw error;
        }

        throw new InternalServerError(`Server error, error: ${error.message}`);
    }
};

module.exports = { loginUser };
