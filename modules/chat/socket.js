const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { findOrCreateConversation, saveMessage } = require('./repository');

// userId -> socketId map for online tracking
const onlineUsers = new Map();

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    // Allow client to reconnect automatically (default reconnection is on client side)
  });

  // ── Auth middleware for socket handshake ──────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: no token'));
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${userId} (${socket.id})`);

    // ── Track online state ────────────────────────────────────────────────
    onlineUsers.set(userId, socket.id);
    io.emit('user:online', { userId });

    // ── Join a conversation room ──────────────────────────────────────────
    // Client emits: { recipientId }
    socket.on('conversation:join', async ({ recipientId }) => {
      try {
        const convo = await findOrCreateConversation(userId, recipientId);
        socket.join(convo._id.toString());
        socket.emit('conversation:joined', { conversationId: convo._id });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Send a message ────────────────────────────────────────────────────
    // Client emits: { conversationId, text }
    socket.on('message:send', async ({ conversationId, text }) => {
      try {
        const message = await saveMessage({ conversationId, senderId: userId, text });
        // Broadcast to everyone in the room (including sender)
        io.to(conversationId).emit('message:receive', message);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user:offline', { userId });
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });

  return io;
};

module.exports = { initSocket, onlineUsers };
