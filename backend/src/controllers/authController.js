const { loginUser } = require('../services/login.service')
const { registerUser } = require('../services/register.service')
const { success } = require('../utils/apiResponse')

const registerController = async (req, res, next) => {
  try {
    // console.log(req.body)
    const result = await registerUser(req.body);
    console.log(result)
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