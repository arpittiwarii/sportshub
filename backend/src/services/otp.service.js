const crypto = require('crypto');
const { DatabaseError } = require('../Error/DataBaseError');
const { ValidationError } = require('../Error/ValidationError');
const { AppError } = require('../Error/AppError');
const { getOtpRepository, createOtpRepository } = require('../repositories/Otp.repository');
const { updateUserById } = require('../repositories/User.repository');
const { emailQueue } = require('../queues/email.queue');

function generateOTP() {
    return crypto.randomInt(0, 10000)
        .toString()
        .padStart(4, '0');
}

const sendOtp = async ({ uid, otp, email, name, session }) => {
    if (!otp || !uid || !email || !name) {
        throw new AppError('OTP could not be generated', 503);
    }

    const otpResult = await createOtpRepository(otp, uid, session ? { session } : {});
    if (!otpResult) {
        throw new DatabaseError('OTP was not created in database');
    }

    await emailQueue.add(
        'otp-email',
        {
            email,
            name,
            otp,
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

    return otpResult;
};

const createOtpService = async ({ userId, email, name, session }) => {
    const newOtp = generateOTP();
    const responseOtp = await sendOtp({ uid: userId, otp: newOtp, email, name, session });
    return { uid: responseOtp.UId };
};

const verifyOtpService = async ({ uid, otp }) => {
    const match = await getOtpRepository(uid, otp);
    if (!match) {
        throw new ValidationError('Invalid OTP. Please enter the code sent to your email.');
    }

    await match.softDelete();
    await updateUserById(uid, { verify: true });

    return { message: 'OTP verified successfully. Your account Under Admin Review.' };
};

module.exports = { createOtpService, verifyOtpService };
