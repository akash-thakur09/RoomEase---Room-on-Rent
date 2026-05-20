const service = require('./service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

// ── Canonical RESTful handlers ────────────────────────────────────────────────

const createRoom = async (req, res) => {
  try {
    const data = await service.createRoom(req.user.id, req.body, req.files);
    return sendSuccess(res, 'Room created', data, 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getRoomsByLandlord = async (req, res) => {
  try {
    const data = await service.getRoomsByLandlord(req.user.id);
    return sendSuccess(res, 'Rooms fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getAllRooms = async (req, res) => {
  try {
    const { city, type, minRent, maxRent, status, search, page, limit } = req.query;
    const data = await service.getAllRooms({ city, type, minRent, maxRent, status, search, page, limit });
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
    // Always use authenticated user's id — never trust req.body.landlord
    const data = await service.updateRoom(req.params.id, req.user.id, req.body, req.files);
    return sendSuccess(res, 'Room updated', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const deleteRoom = async (req, res) => {
  try {
    await service.deleteRoom(req.params.id, req.user.id);
    return sendSuccess(res, 'Room deleted');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

// ── Legacy /user/:id aliases (backward-compat for old frontend) ───────────────

const createRoomLegacy = async (req, res) => {
  try {
    const data = await service.createRoom(req.params.id, req.body, req.files);
    return sendSuccess(res, 'Room created', data, 201);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const getRoomsByLandlordLegacy = async (req, res) => {
  try {
    const data = await service.getRoomsByLandlord(req.params.id);
    return sendSuccess(res, 'Rooms fetched', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const updateRoomLegacy = async (req, res) => {
  try {
    // Legacy: roomId is in body, landlordId from authenticated user
    const roomId = req.body.roomId || req.params.id;
    const data = await service.updateRoom(roomId, req.user.id, req.body, req.files);
    return sendSuccess(res, 'Room updated', data);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

const deleteRoomLegacy = async (req, res) => {
  try {
    await service.deleteRoom(req.params.id, req.user.id);
    return sendSuccess(res, 'Room deleted');
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
};

module.exports = {
  createRoom, getRoomsByLandlord, getAllRooms, getRoomById, updateRoom, deleteRoom,
  createRoomLegacy, getRoomsByLandlordLegacy, updateRoomLegacy, deleteRoomLegacy,
};
