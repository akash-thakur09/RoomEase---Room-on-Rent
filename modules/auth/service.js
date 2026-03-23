const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('./repository');

const register = async ({ name, email, password, role }) => {
  const existing = await repo.findByEmail(email);
  if (existing) throw { status: 400, message: 'User already exists' };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await repo.createUser({ name, email, password: hashedPassword, role });

  const authToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { authToken, userId: user._id, role: user.role };
};

const login = async ({ email, password, role }) => {
  const user = await repo.findByEmail(email);
  if (!user || user.role !== role) throw { status: 401, message: 'Invalid credentials' };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 401, message: 'Invalid credentials' };

  const authToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { authToken, userId: user._id, role: user.role };
};

module.exports = { register, login };
