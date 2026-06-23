const { Fee } = require('../models/fee.model');
const { User } = require('../models/user.model');

async function findAllWithAthlete() {
    return await Fee.findAll({
        include: [{
            model: User,
            required: false, // LEFT JOIN
            attributes: [
                'id',
                'name',
                'email',
                'status',
                'sports',
                'contact',
                'age',
                'school',
                'afiId',
            ]
        }]
    });
}

async function findByUserId(userId) {
    return await Fee.findAll({ where: { userId } });
}

async function findOneByUserMonthYear(userId, month, year) {
    return await Fee.findOne({ where: { userId, month, year } });
}

async function createFee(data) {
    return await Fee.create(data);
}

async function findById(id) {
    return await Fee.findByPk(id);
}

async function updateFee(id, updates) {
    const fee = await Fee.findByPk(id);
    if (!fee) return null;
    await fee.update(updates);
    return await Fee.findByPk(id);
}

module.exports = {
    findAllWithAthlete,
    findByUserId,
    findOneByUserMonthYear,
    createFee,
    findById,
    updateFee,
};
