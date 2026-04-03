const express = require('express');
const router  = express.Router();
const auth    = require('../../middleware/authMiddleware');
const { getConversations, getMessages, startConversation, sendMessageRest } = require('./controller');

// GET  /api/chat/conversations              — list all conversations
router.get('/conversations',              auth, getConversations);
// POST /api/chat/conversations              — find or create a conversation
router.post('/conversations',             auth, startConversation);
// GET  /api/chat/messages/:conversationId   — fetch message history
router.get('/messages/:conversationId',   auth, getMessages);
// POST /api/chat/:conversationId/messages   — REST fallback send (socket preferred)
router.post('/:conversationId/messages',  auth, sendMessageRest);

module.exports = router;
