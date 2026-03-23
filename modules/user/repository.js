const User = require('./model');

const findById = (id) => User.findById(id);
const findByEmail = (email) => User.findOne({ email });
const updateById = (id, data) => User.findByIdAndUpdate(id, data, { new: true });
const deleteByEmail = (email) => User.deleteOne({ email });

module.exports = { findById, findByEmail, updateById, deleteByEmail };
