/**
 * tenantModel.js — REMOVED
 * Tenants are now stored in the unified 'users' collection with role: 'tenant'.
 * Tenant-specific fields (aadharNumber, rentedRoom, etc.) live on modules/user/model.js.
 *
 * This stub re-exports the User model so any legacy code that still imports
 * tenantModel.js does not crash, but you should migrate those imports to userModel.js.
 */
console.warn('[DEPRECATED] tenantModel.js is removed. Import userModel.js instead.');
module.exports = require('../modules/user/model');
