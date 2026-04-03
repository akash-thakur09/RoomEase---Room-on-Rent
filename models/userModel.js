/**
 * userModel.js — UPDATED
 * Unified user model replacing separate tenantModel + landlordModel.
 * Role-specific fields are included conditionally via the role field.
 * Legacy alias: re-exports from modules/user/model.js for backward compatibility.
 */
module.exports = require('../modules/user/model');
