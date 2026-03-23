const Verification = require('./model');

const upsertVerification = (userId, documents) =>
  Verification.findOneAndUpdate(
    { userId },
    { documents, status: 'pending', submittedAt: new Date() },
    { upsert: true, new: true }
  );

const findByUserId = (userId) => Verification.findOne({ userId });

const findById = (id) => Verification.findById(id);

const updateStatus = (id, status, note) =>
  Verification.findByIdAndUpdate(
    id,
    { status, note, reviewedAt: new Date() },
    { new: true }
  );

module.exports = { upsertVerification, findByUserId, findById, updateStatus };
