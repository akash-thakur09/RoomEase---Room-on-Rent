const Payment = require('./model');

const create = (data) => Payment.create(data);

const findByOrderId = (orderId) => Payment.findOne({ orderId });

const updateByOrderId = (orderId, data) =>
  Payment.findOneAndUpdate({ orderId }, data, { new: true });

/** All payments for a set of bookingIds, newest first, with booking populated */
const findByBookingIds = (bookingIds, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  return Promise.all([
    Payment.find({ bookingId: { $in: bookingIds } })
      .populate({
        path: 'bookingId',
        populate: { path: 'propertyId', select: 'type address city' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments({ bookingId: { $in: bookingIds } }),
  ]);
};

const findById = (id) =>
  Payment.findById(id).populate({
    path: 'bookingId',
    populate: [
      { path: 'propertyId', select: 'type address city photos' },
      { path: 'landlordId', select: 'name email' },
    ],
  });

module.exports = { create, findByOrderId, updateByOrderId, findByBookingIds, findById };
