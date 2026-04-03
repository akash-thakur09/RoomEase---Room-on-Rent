/**
 * landlordModel.js — REMOVED
 * Landlords are now stored in the unified 'users' collection with role: 'landlord'.
 * Landlord-specific fields (rooms, contactNumber, profilePhoto) live on modules/user/model.js.
 *
 * This stub re-exports the User model so any legacy code that still imports
 * landlordModel.js does not crash, but you should migrate those imports to userModel.js.
 */
console.warn('[DEPRECATED] landlordModel.js is removed. Import userModel.js instead.');
module.exports = require('../modules/user/model');
