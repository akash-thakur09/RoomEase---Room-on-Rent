const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    bookingId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    comment:      { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// One review per booking per reviewer (tenant reviews landlord, landlord reviews tenant)
reviewSchema.index({ bookingId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ propertyId: 1 });
reviewSchema.index({ targetUserId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
