const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

const authMiddleware = (req, res, next) => {
  try {
    let token = req.header('Authorization');
    if (!token) return sendError(res, 'Access denied. No token provided.', 401);

    if (token.startsWith('Bearer ')) token = token.slice(7).trimLeft();

    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token.', 401);
  }
};

module.exports = authMiddleware;
