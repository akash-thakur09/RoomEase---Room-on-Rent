const repo = require('./repository');
const Booking = require('../booking/model');

const createReview = async ({ reviewerId, bookingId, rating, comment }) => {
  // 1. Booking must exist and be completed
  const booking = await Booking.findById(bookingId);
  if (!booking) throw { status: 404, message: 'Booking not found' };
  if (booking.status !== 'completed') {
    throw { status: 403, message: 'You can only review after a completed booking' };
  }

  // 2. Reviewer must be the tenant on that booking
  if (booking.tenantId.toString() !== reviewerId.toString()) {
    throw { status: 403, message: 'You are not authorized to review this booking' };
  }

  // 3. Prevent duplicate review for the same booking
  const existing = await repo.findByBookingId(bookingId);
  if (existing) throw { status: 409, message: 'You have already reviewed this booking' };

  return repo.create({
    reviewerId,
    targetUserId: booking.landlordId,
    propertyId:   booking.propertyId,
    bookingId,
    rating,
    comment,
  });
};

const getPropertyReviews = (propertyId) => repo.findByProperty(propertyId);

const getUserReviews = (targetUserId) => repo.findByUser(targetUserId);

module.exports = { createReview, getPropertyReviews, getUserReviews };
