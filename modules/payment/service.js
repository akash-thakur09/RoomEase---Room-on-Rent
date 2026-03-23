const crypto = require('crypto');
const Razorpay = require('razorpay');
const repo = require('./repository');
const bookingRepo = require('../booking/repository');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order and persist a pending Payment record.
 */
const createOrder = async ({ bookingId, amount, currency = 'INR' }) => {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) throw { status: 404, message: 'Booking not found' };
  if (booking.paymentStatus === 'paid') throw { status: 400, message: 'Booking already paid' };

  // amount must be in paise (multiply rupees × 100)
  const rzpOrder = await razorpay.orders.create({
    amount,          // caller passes paise directly
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

/**
 * Verify Razorpay webhook signature and update payment + booking status.
 */
const handleWebhook = async (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Validate HMAC-SHA256 signature
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

module.exports = { createOrder, handleWebhook };
