const service = require('./service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating) {
      return sendError(res, 'bookingId and rating are required', 400);
    }
    if (rating < 1 || rating > 5) {
      return sendError(res, 'Rating must be between 1 and 5', 400);
    }
    const data = await service.createReview({
      reviewerId: req.user.id,
      bookingId,
      rating: Number(rating),
      comment,
    });
    return sendSuccess(res, 'Review submitted', data, 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getBookingReviewStatus = async (req, res) => {
  try {
    const data = await service.getBookingReviewStatus({
      bookingId: req.params.bookingId,
      userId: req.user.id,
    });
    return sendSuccess(res, 'Review status fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getPropertyReviews = async (req, res) => {
  try {
    const data = await service.getPropertyReviews(req.params.id);
    return sendSuccess(res, 'Property reviews fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getUserReviews = async (req, res) => {
  try {
    const data = await service.getUserReviews(req.params.id);
    return sendSuccess(res, 'User reviews fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getMyReviews = async (req, res) => {
  try {
    const data = await service.getMyReviews(req.user.id);
    return sendSuccess(res, 'My reviews fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { createReview, getBookingReviewStatus, getPropertyReviews, getUserReviews, getMyReviews };
