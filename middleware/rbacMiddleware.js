const { sendError } = require('../utils/apiResponse');

/**
 * Role-based access control middleware
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden: insufficient permissions.', 403);
    }
    next();
  };
};

module.exports = authorize;
