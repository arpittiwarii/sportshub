
const { DatabaseError } = require('../Error/DataBaseError');
const { ValidationError } = require('../Error/ValidationError');
const bcrypt = require('bcryptjs')

const { findUserByEmail, createUser } = require('../repositories/User.repository');
const { ALLOWED_SPORTS } = require('../utils/constants');
const { createOtpService } = require('./otp.service.js');
const { emailQueue } = require('../queues/email.queue');
const { sequelize } = require('../config/db.js')




// @desc    Register a new athlete
// @route   POST /api/athletes
// @access  Public
async function registerUser({ name, email, password, age, sports, contact, school, afiId, aadhar }) {
    try {
        return await sequelize.transaction(async (t) => {
            // console.log(afiId, aadhar)
            // const aadharCardFile = req.files?.aadharCard?.[0];
            // const birthCertificateFile = req.files?.birthCertificate?.[0];

            if (!name || !email || !password || !age || !sports || !contact || !school || !afiId || !aadhar) {
                throw new ValidationError(message = 'All fields are required');
            }

            if (!ALLOWED_SPORTS.includes(sports)) {
                throw new ValidationError(message = 'Invalid sport value');
            }

            // if (!aadharCardFile) {
            //     return res.status(400).json({ message: 'Aadhar Card file is required.' });
            // }

            // if (!birthCertificateFile) {
            //     return res.status(400).json({ message: 'Birth Certificate file is required.' });
            // }

            const normalizedAfiId = String(afiId).trim();
            if (!normalizedAfiId) {
                throw new ValidationError('AFI ID is required.');
            }

            const userExists = await findUserByEmail(email);
            if (userExists) {
                throw new ValidationError('User already exists with this email');
            }

            const hashPassword = await bcrypt.hash(
                password,
                Number(process.env.SALT_ROUND)
            );
            const user = await createUser({
                name,
                email,
                password: hashPassword,
                role: 'ATHLETE',
                age,
                sports,
                contact,
                afiId: normalizedAfiId,
                school,
                aadhar
            });

            if (!user) {
                throw new DatabaseError('user not created.');
            }

            const otpResult = await createOtpService({
                userId: user.id,
                email: user.email,
                name: user.name,
            });

            await emailQueue.add(
                'welcome-email',
                {
                    email: user.email,
                    name: user.name,
                },
                {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                    removeOnComplete: true,
                }
            );

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                uid: otpResult.uid,
            };

        })

    } catch (error) {
        if (error && error.isOperational) {
            throw error;
        }
        const { InternalServerError } = require('../Error/InternalServerError');
        throw new InternalServerError(`Server error, error: ${error.message}`);
    }
};

module.exports = { registerUser }