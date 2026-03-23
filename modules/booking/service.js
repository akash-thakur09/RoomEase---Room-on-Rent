const repo = require('./repository');
const Room = require('../property/model');

const createBooking = async ({ tenantId, propertyId }) => {
  const room = await Room.findById(propertyId);
  if (!room) throw { status: 404, message: 'Property not found' };
  if (room.status === 'occupied') throw { status: 400, message: 'Property is already occupied' };

  return repo.create({
    tenantId,
    landlordId: room.landlord,
    propertyId,
  });
};

const getBookings = async ({ userId, role, page = 1, limit = 10 }) => {
  const filter = role === 'landlord' ? { landlordId: userId } : { tenantId: userId };
  const [bookings, total] = await repo.findByUser(filter, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  return { bookings, total, page: parseInt(page), limit: parseInt(limit) };
};

const updateBooking = async (id, { status, paymentStatus }, requesterId, requesterRole) => {
  const booking = await repo.findById(id);
  if (!booking) throw { status: 404, message: 'Booking not found' };

  // Only landlord can change booking status; only tenant can update paymentStatus
  if (status && requesterRole !== 'landlord') {
    throw { status: 403, message: 'Only landlords can update booking status' };
  }
  if (paymentStatus && requesterRole !== 'tenant') {
    throw { status: 403, message: 'Only tenants can update payment status' };
  }

  const update = {};
  if (status)        update.status        = status;
  if (paymentStatus) update.paymentStatus = paymentStatus;

  return repo.updateById(id, update);
};

module.exports = { createBooking, getBookings, updateBooking };
