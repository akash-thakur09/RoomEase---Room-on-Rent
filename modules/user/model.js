const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['tenant', 'landlord'], required: true },
    isVerified: { type: Boolean, default: false },
    profilePhoto: { type: String, default: null },
    contactNumber: { type: String, default: null },
    // Tenant-specific
    aadharNumber: { type: String, default: null },
    rentedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    // Landlord-specific
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
