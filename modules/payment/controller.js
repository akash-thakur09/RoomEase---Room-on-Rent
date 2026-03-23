const service = require('./service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

/**
 * POST /api/payments/create-order
 * Body: { bookingId, amount }  — amount in paise
 */
const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    if (!bookingId || !amount) {
      return sendError(res, 'bookingId and amount are required', 400);
    }
    const data = await service.createOrder({ bookingId, amount });
    return sendSuccess(res, 'Order created', data, 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

/**
 * POST /api/payments/webhook
 * Razorpay sends raw body + x-razorpay-signature header
 */
const webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) return sendError(res, 'Missing signature', 400);

    // req.rawBody is set by the raw body middleware in routes.js
    const result = await service.handleWebhook(req.rawBody, signature);
    return sendSuccess(res, 'Webhook processed', result);
  } catch (err) {
    return sendError(res, err.message, err.status || 400);
  }
};

module.exports = { createOrder, webhook };
