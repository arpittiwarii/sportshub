const { loginUser } = require('../service/login.service')
const { registerUser } = require('../service/register.service')
const { success } = require('../utils/apiResponse')

const registerController = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    return success(res, result, 'Registration successfull', 201);
  } catch (err) {
    next(err);
  }
};

const loginController = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    return success(res, result, 'login Successfully', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { registerController, loginController };