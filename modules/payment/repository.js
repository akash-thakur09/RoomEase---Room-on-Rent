const Payment = require('./model');

const create = (data) => Payment.create(data);

const findByOrderId = (orderId) => Payment.findOne({ orderId });

const updateByOrderId = (orderId, data) =>
  Payment.findOneAndUpdate({ orderId }, data, { new: true });

module.exports = { create, findByOrderId, updateByOrderId };
