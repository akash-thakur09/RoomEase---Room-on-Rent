const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    documents:   [{ type: String }], // file paths
    status:      { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt:  { type: Date },
    note:        { type: String }, // optional admin rejection note
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', verificationSchema);
