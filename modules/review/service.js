const repo = require('./repository');
const Booking = require('../booking/model');

const createReview = async ({ reviewerId, bookingId, rating, comment, reviewerRole }) => {
  // 1. Booking must exist and be completed
  const booking = await Booking.findById(bookingId);
  if (!booking) throw { status: 404, message: 'Booking not found' };
  if (booking.status !== 'completed') {
    throw { status: 403, message: 'You can only review after a completed booking' };
  }

  const tenantId   = booking.tenantId.toString();
  const landlordId = booking.landlordId.toString();
  const rid        = reviewerId.toString();

  // 2. Reviewer must be tenant or landlord on that booking
  if (rid !== tenantId && rid !== landlordId) {
    throw { status: 403, message: 'You are not authorized to review this booking' };
  }

  // 3. Prevent duplicate review per booking per reviewer
  const existing = await repo.findByBookingAndReviewer(bookingId, reviewerId);
  if (existing) throw { status: 409, message: 'You have already reviewed this booking' };

  // 4. Determine target: tenant reviews landlord, landlord reviews tenant
  const targetUserId = rid === tenantId ? landlordId : tenantId;

  return repo.create({
    reviewerId,
    targetUserId,
    propertyId: booking.propertyId,
    bookingId,
    rating,
    comment,
  });
};

const getBookingReviewStatus = async ({ bookingId, userId }) => {
  const review = await repo.findByBookingAndReviewer(bookingId, userId);
  return { hasReviewed: !!review };
};

const getPropertyReviews = (propertyId) => repo.findByProperty(propertyId);

const getUserReviews = (targetUserId) => repo.findByUser(targetUserId);

const getMyReviews = (reviewerId) => repo.findByReviewer(reviewerId);

module.exports = { createReview, getBookingReviewStatus, getPropertyReviews, getUserReviews, getMyReviews };
