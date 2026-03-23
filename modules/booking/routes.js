const express = require('express');
const router = express.Router();
const controller = require('./controller');
const authMiddleware = require('../../middleware/authMiddleware');
const requireVerified = require('../../middleware/verifiedMiddleware');

// POST /api/bookings        → create booking (tenant, must be verified)
// GET  /api/bookings        → fetch bookings for current user (filtered by role)
// PUT  /api/bookings/:id    → update booking status
router.post('/',    authMiddleware, requireVerified, controller.createBooking);
router.get('/',     authMiddleware, controller.getBookings);
router.put('/:id',  authMiddleware, controller.updateBooking);

module.exports = router;
