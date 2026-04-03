const repo = require('./repository');
const Room = require('../property/model');
const User = require('../user/model');

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

  // Only landlord can approve/reject/complete; only tenant can cancel their own pending booking
  if (status === 'cancelled') {
    if (requesterRole !== 'tenant') throw { status: 403, message: 'Only tenants can cancel bookings' };
    if (booking.tenantId._id.toString() !== requesterId.toString()) {
      throw { status: 403, message: 'You can only cancel your own bookings' };
    }
    if (!['pending', 'approved'].includes(booking.status)) {
      throw { status: 400, message: `Cannot cancel a booking with status: ${booking.status}` };
    }
  } else if (status) {
    if (requesterRole !== 'landlord') {
      throw { status: 403, message: 'Only landlords can update booking status' };
    }
  }

  if (paymentStatus && requesterRole !== 'tenant') {
    throw { status: 403, message: 'Only tenants can update payment status' };
  }

  const update = {};
  if (status)        update.status        = status;
  if (paymentStatus) update.paymentStatus = paymentStatus;

  const updated = await repo.updateById(id, update);

  // ── Side effects on status change ────────────────────────────────────────
  if (status === 'approved') {
    // Set tenant's current room
    await User.findByIdAndUpdate(booking.tenantId._id, { rentedRoom: booking.propertyId._id });
    // Mark property as occupied
    await Room.findByIdAndUpdate(booking.propertyId._id, { status: 'occupied' });
  } else if (status === 'completed' || status === 'cancelled' || status === 'rejected') {
    // Clear tenant's current room if it matches this property
    await User.findOneAndUpdate(
      { _id: booking.tenantId._id, rentedRoom: booking.propertyId._id },
      { rentedRoom: null }
    );
    // Mark property as available again
    await Room.findByIdAndUpdate(booking.propertyId._id, { status: 'available' });
  }

  return updated;
};

module.exports = { createBooking, getBookings, updateBooking };
