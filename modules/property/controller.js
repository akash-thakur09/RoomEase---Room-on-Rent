const service = require('./service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const createRoom = async (req, res) => {
  try {
    const data = await service.createRoom(req.params.id, req.body, req.files);
    return sendSuccess(res, 'Room created', data, 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getRoomsByLandlord = async (req, res) => {
  try {
    const data = await service.getRoomsByLandlord(req.params.id);
    return sendSuccess(res, 'Rooms fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getAllRooms = async (req, res) => {
  try {
    const { city, type, page, limit } = req.query;
    const data = await service.getAllRooms({ city, type, page, limit });
    return sendSuccess(res, 'Rooms fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getRoomById = async (req, res) => {
  try {
    const data = await service.getRoomById(req.params.id);
    return sendSuccess(res, 'Room fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const updateRoom = async (req, res) => {
  try {
    const landlordId = req.body.landlord || req.user.id;
    const data = await service.updateRoom(req.params.id, landlordId, req.body, req.files);
    return sendSuccess(res, 'Room updated', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const deleteRoom = async (req, res) => {
  try {
    await service.deleteRoom(req.params.id);
    return sendSuccess(res, 'Room deleted');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = { createRoom, getRoomsByLandlord, getAllRooms, getRoomById, updateRoom, deleteRoom };
