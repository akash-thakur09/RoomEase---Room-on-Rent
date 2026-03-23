const repo = require('./repository');
const Room = require('../property/model');

const getProfile = async (id) => {
  const user = await repo.findById(id);
  if (!user) throw { status: 404, message: 'User not found' };
  const { password, ...profile } = user.toObject();
  return profile;
};

const updateProfile = async (id, data) => {
  // Prevent password/role updates through this endpoint
  delete data.password;
  delete data.role;
  const user = await repo.updateById(id, data);
  if (!user) throw { status: 404, message: 'User not found' };
  const { password, ...profile } = user.toObject();
  return profile;
};

const deleteAccount = async (email) => {
  const result = await repo.deleteByEmail(email);
  if (result.deletedCount === 0) throw { status: 404, message: 'User not found' };
};

const updateProfilePhoto = async (id, filePath) => {
  const user = await repo.updateById(id, { profilePhoto: filePath });
  if (!user) throw { status: 404, message: 'User not found' };
  return user;
};

const getTenantRoom = async (id) => {
  const user = await repo.findById(id);
  if (!user) throw { status: 404, message: 'User not found' };
  if (!user.rentedRoom) throw { status: 404, message: 'No rented room found' };
  const room = await Room.findById(user.rentedRoom);
  if (!room) throw { status: 404, message: 'Room not found' };
  return room;
};

module.exports = { getProfile, updateProfile, deleteAccount, updateProfilePhoto, getTenantRoom };
