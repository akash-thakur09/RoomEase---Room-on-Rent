const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware');
const authorize = require('../../middleware/rbacMiddleware');
const { getStats } = require('./statsController');

// GET /api/landlord/stats — aggregated dashboard data
router.get('/stats', authMiddleware, authorize('landlord'), getStats);

module.exports = router;
