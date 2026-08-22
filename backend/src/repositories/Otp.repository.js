const mongoose = require('mongoose');
const { OTP } = require("../models/otp.model");

// How long a freshly issued OTP remains valid.
const OTP_TTL_SECONDS = 10 * 60;

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

const createOtpRepository = async (newotp, uid, options = {}) => {
    // Invalidate any prior active OTPs for this user so only the newest code
    // can ever verify. Runs inside the caller's transaction when provided.
    await OTP.updateMany(
        { UId: uid, deletedAt: null },
        { $set: { deletedAt: new Date() } },
        options
    );

    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);
    const [otp] = await OTP.create([{ otp: newotp, UId: uid, expiresAt }], options);
    return otp;
};

// Returns the user's newest still-valid OTP (not soft-deleted, not expired),
// regardless of the submitted code — the service compares the value itself so
// it can enforce an attempt cap on wrong guesses.
const findActiveOtpByUser = async (uid) => {
    if (!isValidId(uid)) return null;
    return await OTP.findOne({ UId: uid, expiresAt: { $gt: new Date() } })
        .sort({ createdAt: -1 });
};

const incrementOtpAttempts = async (id) => {
    if (!isValidId(id)) return null;
    return await OTP.findByIdAndUpdate(id, { $inc: { attempts: 1 } }, { new: true });
};

module.exports = { createOtpRepository, findActiveOtpByUser, incrementOtpAttempts, OTP_TTL_SECONDS };
