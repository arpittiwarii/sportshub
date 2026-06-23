const { User } = require('../models/user.model')

async function findUserByEmail(email) {
    return await User.scope('withPassword').findOne({ where: { email } })
}

async function findAllAthletes() {
    return await User.findAll({
        where: { role: 'ATHLETE' },
        order: [['createdAt', 'DESC']],
    })
}

async function createUser(data) {
    const user = await User.create(data)
    return user;
}

async function findUserById(id, options = {}) {
    return await User.findByPk(id, options)
}

async function updateUserById(id, updates) {
    const user = await User.findByPk(id)
    if (!user) return null
    await user.update(updates)
    return await user.reload()
}

async function deleteUserById(id) {
    const user = await User.findByPk(id)
    if (!user) return null
    await user.destroy()
    return true
}

async function countAdminUsers() {
    return await User.count({ where: { role: 'ADMIN' } })
}

async function findApprovedAthletes() {
    return await User.findAll({
        where: { role: 'ATHLETE', status: 'APPROVED' },
        attributes: { exclude: ['password'] }
    })
}

module.exports = {
    findUserByEmail,
    findAllAthletes,
    createUser,
    findUserById,
    updateUserById,
    deleteUserById,
    countAdminUsers,
    findApprovedAthletes,
}