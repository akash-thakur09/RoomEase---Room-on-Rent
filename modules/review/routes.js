const express = require('express');
const router = express.Router();
const controller = require('./controller');
const authMiddleware = require('../../middleware/authMiddleware');

// POST /api/reviews              → submit a review (authenticated tenant)
// GET  /api/reviews/property/:id → reviews + avg rating for a property
// GET  /api/reviews/user/:id     → reviews + avg rating for a user
router.post('/',                authMiddleware, controller.createReview);
router.get('/property/:id',     controller.getPropertyReviews);
router.get('/user/:id',         controller.getUserReviews);

module.exports = router;
