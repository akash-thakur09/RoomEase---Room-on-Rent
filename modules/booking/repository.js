const Booking = require('./model');

const create = (data) => Booking.create(data);

const findById = (id) =>
  Booking.findById(id)
    .populate('tenantId', 'name email')
    .populate('landlordId', 'name email')
    .populate('propertyId', 'type address city status');

const findByUser = ({ tenantId, landlordId }, { page, limit }) => {
  const query = {};
  if (tenantId)   query.tenantId   = tenantId;
  if (landlordId) query.landlordId = landlordId;

  const skip = (page - 1) * limit;
  return Promise.all([
    Booking.find(query)
      .populate('tenantId', 'name email')
      .populate('landlordId', 'name email')
      .populate('propertyId', 'type address city status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query),
  ]);
};

const updateById = (id, data) =>
  Booking.findByIdAndUpdate(id, data, { new: true });

module.exports = { create, findById, findByUser, updateById };
