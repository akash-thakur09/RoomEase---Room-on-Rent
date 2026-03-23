const repo = require('./repository');

const uploadDocuments = async (userId, filePaths) => {
  if (!filePaths || filePaths.length === 0) {
    const err = new Error('No documents provided'); err.status = 400; throw err;
  }
  return repo.upsertVerification(userId, filePaths);
};

const getStatus = async (userId) => {
  const record = await repo.findByUserId(userId);
  if (!record) {
    const err = new Error('No verification record found'); err.status = 404; throw err;
  }
  return record;
};

const reviewVerification = async (id, status, note) => {
  if (!['verified', 'rejected'].includes(status)) {
    const err = new Error('Status must be verified or rejected'); err.status = 400; throw err;
  }
  const record = await repo.updateStatus(id, status, note);
  if (!record) {
    const err = new Error('Verification record not found'); err.status = 404; throw err;
  }
  return record;
};

module.exports = { uploadDocuments, getStatus, reviewVerification };
