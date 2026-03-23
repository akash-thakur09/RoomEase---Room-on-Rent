const User = require('../user/model');

const findByEmail = (email) => User.findOne({ email });
const findById = (id) => User.findById(id);
const createUser = (data) => User.create(data);

module.exports = { findByEmail, findById, createUser };
