/**
 * requestModel.js — REMOVED
 * Replaced by bookingModel.js / modules/booking/model.js.
 * The new Booking model has richer status tracking and payment linkage.
 *
 * This stub re-exports the Booking model so any legacy code that still imports
 * requestModel.js does not crash, but you should migrate those imports to bookingModel.js.
 */
console.warn('[DEPRECATED] requestModel.js is removed. Import bookingModel.js instead.');
module.exports = require('../modules/booking/model');
