const express = require('express');
const router  = express.Router();
const auth    = require('../../middleware/authMiddleware');
const { getConversations, getMessages } = require('./controller');

// GET /api/chat/conversations  — list all conversations for the logged-in user
router.get('/conversations', auth, getConversations);

// GET /api/chat/messages/:conversationId  — fetch history for a conversation
router.get('/messages/:conversationId', auth, getMessages);

module.exports = router;
