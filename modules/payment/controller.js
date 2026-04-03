const service = require('./service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

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

const webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) return sendError(res, 'Missing signature', 400);
    const result = await service.handleWebhook(req.rawBody, signature);
    return sendSuccess(res, 'Webhook processed', result);
  } catch (err) {
    return sendError(res, err.message, err.status || 400);
  }
};

/** GET /api/payments — payment history for the current user */
const getPaymentHistory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await service.getPaymentHistory({
      userId: req.user.id,
      page,
      limit,
    });
    return sendSuccess(res, 'Payment history fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

/** GET /api/payments/:id — single payment detail */
const getPaymentById = async (req, res) => {
  try {
    const data = await service.getPaymentById(req.params.id);
    return sendSuccess(res, 'Payment fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { createOrder, webhook, getPaymentHistory, getPaymentById };
