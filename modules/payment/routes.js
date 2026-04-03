const express = require('express');
const router = express.Router();
const controller = require('./controller');
const authMiddleware = require('../../middleware/authMiddleware');

const rawBodyCapture = express.raw({ type: 'application/json' });

// GET  /api/payments          — payment history for current user
router.get('/',              authMiddleware, controller.getPaymentHistory);

// GET  /api/payments/:id      — single payment detail
router.get('/:id',           authMiddleware, controller.getPaymentById);

// POST /api/payments/create-order
router.post('/create-order', authMiddleware, controller.createOrder);

// POST /api/payments/webhook
router.post('/webhook', rawBodyCapture, (req, res, next) => {
  req.rawBody = req.body;
  next();
}, controller.webhook);

module.exports = router;
