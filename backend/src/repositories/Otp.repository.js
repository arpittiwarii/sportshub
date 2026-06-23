const { OTP } = require("../models/otp.model")

const createOtpRepository = async (newotp, uid) => {
    return await OTP.create({ otp: newotp, UId: uid })
}
const getOtpRepository = async (uid, otp) => {
    return await OTP.findOne({ where: { UId: uid, otp: otp } })
}

module.exports = { createOtpRepository, getOtpRepository }