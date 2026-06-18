const { User } = require('../models/user.model')

async function findUserByEmail(email) {
    const user = await User.findOne({ email });
    return user;
}