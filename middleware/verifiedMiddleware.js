const Verification = require('../modules/verification/model');
const { sendError } = require('../utils/apiResponse');

/**
 * Blocks the request if the authenticated user is not verified.
 * Used to restrict landlords from adding properties and tenants from booking.
 */
const requireVerified = async (req, res, next) => {
  try {
    const record = await Verification.findOne({ userId: req.user.id });

    if (!record) {
      return sendError(res, 'Verification required. Please submit your documents.', 403);
    }

    if (record.status === 'pending') {
      return sendError(res, 'Your verification is pending review. Please wait for approval.', 403);
    }

    if (record.status === 'rejected') {
      return sendError(res, 'Your verification was rejected. Please re-submit your documents.', 403);
    }

    next();
  } catch (err) {
    return sendError(res, 'Verification check failed', 500);
  }
};

module.exports = requireVerified;
