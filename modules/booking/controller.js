const service = require('./service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const createBooking = async (req, res) => {
  try {
    const data = await service.createBooking({
      tenantId: req.user.id,
      propertyId: req.body.propertyId,
    });
    return sendSuccess(res, 'Booking created', data, 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getBookings = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await service.getBookings({
      userId: req.user.id,
      role: req.user.role,
      page,
      limit,
    });
    return sendSuccess(res, 'Bookings fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const updateBooking = async (req, res) => {
  try {
    const data = await service.updateBooking(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    return sendSuccess(res, 'Booking updated', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { createBooking, getBookings, updateBooking };
