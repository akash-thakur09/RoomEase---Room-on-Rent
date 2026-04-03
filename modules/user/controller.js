const service = require('./service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const getProfile = async (req, res) => {
  try {
    const data = await service.getProfile(req.params.id);
    return sendSuccess(res, 'Profile fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    // Users can only update their own profile
    if (req.user.id !== req.params.id) {
      return sendError(res, 'Forbidden: you can only update your own profile', 403);
    }
    const data = await service.updateProfile(req.params.id, req.body);
    return sendSuccess(res, 'Profile updated', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const deleteAccount = async (req, res) => {
  try {
    // Verify the authenticated user owns this account
    const profile = await service.getProfile(req.user.id);
    if (profile.email !== req.params.email) {
      return sendError(res, 'Forbidden: you can only delete your own account', 403);
    }
    await service.deleteAccount(req.params.email);
    return sendSuccess(res, 'Account deleted successfully');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    // Users can only update their own photo
    if (req.user.id !== req.params.id) {
      return sendError(res, 'Forbidden: you can only update your own profile photo', 403);
    }
    await service.updateProfilePhoto(req.params.id, req.file.path);
    return sendSuccess(res, 'Profile photo uploaded', { filePath: req.file.path });
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getTenantRoom = async (req, res) => {
  try {
    const data = await service.getTenantRoom(req.params.id);
    return sendSuccess(res, 'Room fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { getProfile, updateProfile, deleteAccount, uploadProfilePhoto, getTenantRoom };
