const repo = require('./repository');
const User = require('../user/model');

const createRoom = async (landlordId, data, files) => {
  const landlord = await User.findById(landlordId);
  if (!landlord || landlord.role !== 'landlord') {
    throw { status: 403, message: 'Only landlords can create rooms' };
  }

  const room = await repo.create({
    ...data,
    landlord: landlordId,
    photos: files ? files.map((f) => f.path) : [],
  });

  await User.findByIdAndUpdate(landlordId, { $push: { rooms: room._id } });
  return room;
};

const getRoomsByLandlord = async (landlordId) => {
  return repo.findByLandlord(landlordId);
};

const getAllRooms = async ({ city, type, minRent, maxRent, status, search, page = 1, limit = 12 } = {}) => {
  const query = {};

  // Exact city match (case-insensitive)
  if (city)   query.city   = { $regex: new RegExp(`^${city}$`, 'i') };
  if (type)   query.type   = type;
  if (status) query.status = status;

  // Free-text search across address, city, description
  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [{ address: re }, { city: re }, { description: re }];
  }

  if (minRent || maxRent) {
    query.rent = {};
    if (minRent) query.rent.$gte = parseInt(minRent);
    if (maxRent) query.rent.$lte = parseInt(maxRent);
  }

  const [rooms, total] = await repo.findAll(query, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  return { rooms, total, page: parseInt(page), limit: parseInt(limit) };
};

const getRoomById = async (id) => {
  const room = await repo.findById(id);
  if (!room) throw { status: 404, message: 'Room not found' };
  return room;
};

const updateRoom = async (roomId, landlordId, data, files) => {
  const room = await repo.findById(roomId);
  if (!room) throw { status: 404, message: 'Room not found' };
  if (room.landlord.toString() !== landlordId) {
    throw { status: 403, message: 'Not authorized to update this room' };
  }

  const updateData = { ...data };
  if (files && files.length > 0) updateData.photos = files.map((f) => f.path);

  return repo.updateById(roomId, updateData);
};

const deleteRoom = async (roomId, landlordId) => {
  const room = await repo.findById(roomId);
  if (!room) throw { status: 404, message: 'Room not found' };
  if (landlordId && room.landlord.toString() !== landlordId.toString()) {
    throw { status: 403, message: 'Not authorized to delete this room' };
  }
  await repo.deleteById(roomId);
  await User.findByIdAndUpdate(room.landlord, { $pull: { rooms: room._id } });
};

module.exports = { createRoom, getRoomsByLandlord, getAllRooms, getRoomById, updateRoom, deleteRoom };
