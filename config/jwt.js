const jwt = require('jsonwebtoken');
const key = process.env.ACCESS_TOKEN_SECRET; // jwt secret key 123456789@akash

// Generate JWT token
const generateToken = (userId) => {
  const token = jwt.sign({ id: userId }, key, { expiresIn: '7d' });
  return token;
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decodedToken = jwt.verify(token, key);
    return decodedToken;
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
