const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const { createReview, getPropertyReviews, getUserReviews, getMyReviews, getBookingReviewStatus } = require('./controller');

// POST /api/reviews              → submit a review (authenticated)
// GET  /api/reviews/my           → reviews written by the current user
// GET  /api/reviews/booking/:bookingId/status → has current user reviewed this booking?
// GET  /api/reviews/property/:id → reviews + avg rating for a property
// GET  /api/reviews/user/:id     → reviews + avg rating for a user
router.post('/',                          authMiddleware, createReview);
router.get('/my',                         authMiddleware, getMyReviews);
router.get('/booking/:bookingId/status',  authMiddleware, getBookingReviewStatus);
router.get('/property/:id',               getPropertyReviews);
router.get('/user/:id',                   getUserReviews);

module.exports = router;
