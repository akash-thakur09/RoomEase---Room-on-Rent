const express = require('express');
const router = express.Router();
const controller = require('./controller');
const authMiddleware = require('../../middleware/authMiddleware');

/**
 * Capture raw body for webhook signature verification.
 * Must be applied BEFORE express.json() parses the body.
 */
const rawBodyCapture = express.raw({ type: 'application/json' });

// POST /api/payments/create-order  — authenticated tenants only
router.post('/create-order', authMiddleware, controller.createOrder);

// POST /api/payments/webhook  — public, raw body required for HMAC verification
router.post('/webhook', rawBodyCapture, (req, res, next) => {
  req.rawBody = req.body; // Buffer from express.raw
  next();
}, controller.webhook);

module.exports = router;
