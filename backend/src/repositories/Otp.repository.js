const mongoose = require('mongoose');
const { OTP } = require("../models/otp.model");

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

const createOtpRepository = async (newotp, uid, options = {}) => {
    const [otp] = await OTP.create([{ otp: newotp, UId: uid }], options);
    return otp;
};

const getOtpRepository = async (uid, otp) => {
    if (!isValidId(uid)) return null;
    return await OTP.findOne({ UId: uid, otp });
};

module.exports = { createOtpRepository, getOtpRepository };
