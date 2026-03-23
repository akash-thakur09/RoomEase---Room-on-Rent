const service = require('./service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

// POST /api/verification/upload
const uploadDocuments = async (req, res) => {
  try {
    const filePaths = (req.files || []).map((f) => f.path);
    const data = await service.uploadDocuments(req.user.id, filePaths);
    return sendSuccess(res, 'Documents submitted for verification', data, 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// GET /api/verification/status/:userId
const getStatus = async (req, res) => {
  try {
    const data = await service.getStatus(req.params.userId);
    return sendSuccess(res, 'Verification status fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// PUT /api/verification/:id  (admin)
const reviewVerification = async (req, res) => {
  try {
    const { status, note } = req.body;
    const data = await service.reviewVerification(req.params.id, status, note);
    return sendSuccess(res, `Verification ${status}`, data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { uploadDocuments, getStatus, reviewVerification };
