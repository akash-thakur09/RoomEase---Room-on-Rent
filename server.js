require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { initSocket } = require('./modules/chat/socket');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ── DB ────────────────────────────────────────────────────────────────────────
connectDB();

// ── Static files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./modules/auth/routes'));
app.use('/api/users',        require('./modules/user/routes'));   // canonical
app.use('/api/user',         require('./modules/user/routes'));   // legacy alias
app.use('/api/landlord',     require('./modules/landlord/routes'));
app.use('/api/properties',   require('./modules/property/routes')); // canonical
app.use('/api/room',         require('./modules/property/routes')); // legacy alias
app.use('/api/bookings',     require('./modules/booking/routes'));
app.use('/api/request',      require('./modules/booking/routes')); // legacy alias
app.use('/api/reviews',      require('./modules/review/routes'));
app.use('/api/review',       require('./modules/review/routes')); // legacy alias
app.use('/api/chat',         require('./modules/chat/routes'));
app.use('/api/payments',     require('./modules/payment/routes'));
app.use('/api/payment',      require('./modules/payment/routes')); // legacy alias
app.use('/api/verification', require('./modules/verification/routes'));

// ── API 404 handler (must be before React catch-all) ─────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// ── Serve React build ─────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '/client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Socket.io ─────────────────────────────────────────────────────────────────
initSocket(httpServer);

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
