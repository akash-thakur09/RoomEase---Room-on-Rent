const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    bookingId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating:       { type: Number, required: true, min: 1, max: 5 },
    comment:      { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per booking (enforced at DB level too)
reviewSchema.index({ bookingId: 1 }, { unique: true });
reviewSchema.index({ propertyId: 1 });
reviewSchema.index({ targetUserId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
