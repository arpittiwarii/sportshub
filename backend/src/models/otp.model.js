const mongoose = require('mongoose');
const { baseSchemaOptions, withSoftDelete } = require('./model.utils');

const otpSchema = new mongoose.Schema(
    {
        UId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            default: null,
        },
        otp: {
            type: String,
            trim: true,
            required: true,
        },
    },
    baseSchemaOptions()
);

withSoftDelete(otpSchema);

const OTP = mongoose.models.otps || mongoose.model('otps', otpSchema);

module.exports = { OTP };
