/**
 * Centralized API response formatter
 */
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const sendSuccess = (res, message, data = null, statusCode = 200) =>
  sendResponse(res, statusCode, true, message, data);

const sendError = (res, message, statusCode = 500, data = null) =>
  sendResponse(res, statusCode, false, message, data);

module.exports = { sendSuccess, sendError };
