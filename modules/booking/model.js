const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tenantId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landlordId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    status:        { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  },
  { timestamps: true }
);

// Indexes for efficient filtering
bookingSchema.index({ tenantId: 1 });
bookingSchema.index({ landlordId: 1 });
bookingSchema.index({ propertyId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
