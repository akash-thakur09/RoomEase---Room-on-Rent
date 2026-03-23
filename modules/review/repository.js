const Review = require('./model');

const create = (data) => Review.create(data);

const findByBookingId = (bookingId) => Review.findOne({ bookingId });

/** Reviews for a property with avg rating via aggregation */
const findByProperty = async (propertyId) => {
  const [meta] = await Review.aggregate([
    { $match: { propertyId: require('mongoose').Types.ObjectId.createFromHexString(propertyId) } },
    {
      $group: {
        _id: '$propertyId',
        averageRating: { $avg: '$rating' },
        totalReviews:  { $sum: 1 },
      },
    },
  ]);

  const reviews = await Review.find({ propertyId })
    .populate('reviewerId', 'name email')
    .sort({ createdAt: -1 });

  return {
    averageRating: meta ? parseFloat(meta.averageRating.toFixed(2)) : 0,
    totalReviews:  meta ? meta.totalReviews : 0,
    reviews,
  };
};

/** Reviews targeting a user (landlord/tenant) with avg rating */
const findByUser = async (targetUserId) => {
  const [meta] = await Review.aggregate([
    { $match: { targetUserId: require('mongoose').Types.ObjectId.createFromHexString(targetUserId) } },
    {
      $group: {
        _id: '$targetUserId',
        averageRating: { $avg: '$rating' },
        totalReviews:  { $sum: 1 },
      },
    },
  ]);

  const reviews = await Review.find({ targetUserId })
    .populate('reviewerId', 'name email')
    .populate('propertyId', 'type address city')
    .sort({ createdAt: -1 });

  return {
    averageRating: meta ? parseFloat(meta.averageRating.toFixed(2)) : 0,
    totalReviews:  meta ? meta.totalReviews : 0,
    reviews,
  };
};

module.exports = { create, findByBookingId, findByProperty, findByUser };
