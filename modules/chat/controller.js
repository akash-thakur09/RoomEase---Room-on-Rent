const { getConversationsByUser, getMessagesByConversation, findOrCreateConversation, saveMessage } = require('./repository');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const getConversations = async (req, res) => {
  try {
    const conversations = await getConversationsByUser(req.user.id);
    sendSuccess(res, 'Conversations fetched', conversations);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

const startConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) return sendError(res, 'recipientId is required', 400);
    const conversation = await findOrCreateConversation(req.user.id, recipientId);
    sendSuccess(res, 'Conversation ready', conversation, 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await getMessagesByConversation(req.params.conversationId);
    sendSuccess(res, 'Messages fetched', messages);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

/** REST fallback for sending a message (socket is preferred) */
const sendMessageRest = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return sendError(res, 'text is required', 400);
    const message = await saveMessage({
      conversationId: req.params.conversationId,
      senderId: req.user.id,
      text: text.trim(),
    });
    sendSuccess(res, 'Message sent', message, 201);
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

module.exports = { getConversations, startConversation, getMessages, sendMessageRest };
