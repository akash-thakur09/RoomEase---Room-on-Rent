const crypto = require('crypto');
const Razorpay = require('razorpay');
const repo = require('./repository');
const bookingRepo = require('../booking/repository');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async ({ bookingId, amount, currency = 'INR' }) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw { status: 404, message: 'Booking not found' };
  if (booking.paymentStatus === 'paid') throw { status: 400, message: 'Booking already paid' };

  const rzpOrder = await razorpay.orders.create({
    amount,
    currency,
    receipt: `booking_${bookingId}`,
    notes: { bookingId: bookingId.toString() },
  });

  const payment = await repo.create({
    bookingId,
    amount,
    orderId: rzpOrder.id,
  });

  return { order: rzpOrder, payment };
};

const handleWebhook = async (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  if (expectedSig !== signature) {
    throw { status: 400, message: 'Invalid webhook signature' };
  }

  const event = JSON.parse(rawBody);
  const { event: eventType, payload } = event;

  if (eventType === 'payment.captured') {
    const { payment: { entity } } = payload;
    const { order_id, id: transactionId } = entity;

    const payment = await repo.updateByOrderId(order_id, {
      status: 'success',
      transactionId,
      signature,
    });

    if (payment) {
      await bookingRepo.updateById(payment.bookingId.toString(), { paymentStatus: 'paid' });
    }
  } else if (eventType === 'payment.failed') {
    const { payment: { entity } } = payload;
    await repo.updateByOrderId(entity.order_id, { status: 'failed' });
  }

  return { received: true };
};

/**
 * Get paginated payment history for a user (via their bookings).
 */
const getPaymentHistory = async ({ userId, page = 1, limit = 10 }) => {
  // Fetch all booking IDs for this user
  const [bookings] = await bookingRepo.findByUser({ tenantId: userId }, { page: 1, limit: 1000 });
  const bookingIds = bookings.map((b) => b._id);

  if (!bookingIds.length) return { payments: [], total: 0, page, limit };

  const [payments, total] = await repo.findByBookingIds(bookingIds, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return { payments, total, page: parseInt(page), limit: parseInt(limit) };
};

const getPaymentById = async (id) => {
  const payment = await repo.findById(id);
  if (!payment) throw { status: 404, message: 'Payment not found' };
  return payment;
};

module.exports = { createOrder, handleWebhook, getPaymentHistory, getPaymentById };
