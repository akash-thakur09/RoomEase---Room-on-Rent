const service = require('./service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const register = async (req, res) => {
  try {
    const data = await service.register(req.body);
    return sendSuccess(res, 'User registered successfully', data, 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const login = async (req, res) => {
  try {
    const data = await service.login(req.body);
    return sendSuccess(res, 'Login successful', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { register, login };
