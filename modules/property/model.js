const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    type:     { type: String, required: true, enum: ['single', 'sharing', 'apartment'] },
    email:    { type: String, required: true },
    photos:   [{ type: String }],
    address:  { type: String, required: true },
    city:     { type: String, required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status:   { type: String, enum: ['available', 'occupied'], default: 'available' },
  },
  { timestamps: true }
);

// Indexes for optimized filtering
roomSchema.index({ city: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ landlord: 1 });

module.exports = mongoose.model('Room', roomSchema);
