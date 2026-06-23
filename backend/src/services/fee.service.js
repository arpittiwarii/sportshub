const { findAllWithAthlete, findByUserId, findOneByUserMonthYear, createFee, findById, updateFee } = require('../repositories/Fee.repository');
const { findApprovedAthletes } = require('../repositories/User.repository');
const { uploadBufferToCloudinary } = require('./cloudinaryUpload');
const { DatabaseError } = require('../Error/DataBaseError');
const { InternalServerError } = require('../Error/InternalServerError');
const { ValidationError } = require('../Error/ValidationError');

const getAllFees = async () => {
    try {

        return await findAllWithAthlete();
    } catch (error) {
        console.log(error)
        throw new InternalServerError(error.message);
    }
};

const getMyFees = async (userId) => {
    try {
        return await findByUserId(userId);
    } catch (error) {
        throw new InternalServerError(error.message);
    }
};

const generateMonthlyFees = async ({ month, year, amount }) => {
    if (!month || !year || !amount) throw new ValidationError('Month, year, and amount are required');

    try {
        const athletes = await findApprovedAthletes();
        let createdCount = 0;
        for (const athlete of athletes) {
            const exists = await findOneByUserMonthYear(athlete.id, month, year);
            if (!exists) {
                await createFee({ userId: athlete.id, month, year, amount });
                createdCount++;
            }
        }
        return { message: `Successfully generated ${createdCount} Fee records for ${month} ${year}` };
    } catch (error) {
        throw new InternalServerError(error.message);
    }
};

const uploadFeeProof = async (feeId, userId) => {
    try {
        const fee = await findById(feeId);
        console.log(fee)
        if (!fee) throw new ValidationError('Fee record not found');
        if (fee.userId !== userId) throw new ValidationError('Not authorized to update this record');

        // const folder = `sports-hub/fees/${fee.id.toString()}`;
        // const result = await uploadBufferToCloudinary(fileBuffer, { folder, publicId: 'screenshot' });

        const updated = await updateFee(feeId, { screenshot: null, status: 'PENDING', submittedAt: new Date() });
        return updated;
    } catch (error) {
        if (error instanceof ValidationError) throw error;
        throw new InternalServerError(error.message);
    }
};

const verifyFee = async (feeId, status) => {
    try {
        const valid = ['PENDING', 'APPROVED', 'REJECT'];
        const upper = String(status).toUpperCase();
        if (!valid.includes(upper)) throw new ValidationError('Invalid status');
        const fee = await findById(feeId);
        if (!fee) throw new ValidationError('Fee record not found');
        const updated = await updateFee(feeId, { status: upper, verifiedAt: new Date() });
        return updated;
    } catch (error) {
        if (error instanceof ValidationError) throw error;
        throw new InternalServerError(error.message);
    }
};

module.exports = { getAllFees, getMyFees, generateMonthlyFees, uploadFeeProof, verifyFee };
