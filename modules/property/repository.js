const Room = require('./model');

const create = (data) => Room.create(data);
const findById = (id) => Room.findById(id);
const findByLandlord = (landlordId) => Room.find({ landlord: landlordId });
const updateById = (id, data) => Room.findByIdAndUpdate(id, data, { new: true });
const deleteById = (id) => Room.findByIdAndDelete(id);

const findAll = (query = {}, { page, limit } = {}) => {
  const skip = (page - 1) * limit;
  return Promise.all([
    Room.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Room.countDocuments(query),
  ]);
};

module.exports = { create, findById, findAll, findByLandlord, updateById, deleteById };
