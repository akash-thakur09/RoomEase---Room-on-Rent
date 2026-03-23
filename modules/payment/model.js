const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount:        { type: Number, required: true }, // in paise (INR smallest unit)
    status:        { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
    transactionId: { type: String, default: null }, // Razorpay payment_id after capture
    orderId:       { type: String, required: true }, // Razorpay order_id
    signature:     { type: String, default: null }, // Razorpay signature (stored after verification)
  },
  { timestamps: true }
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ orderId: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
