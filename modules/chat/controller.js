const { getConversationsByUser, getMessagesByConversation } = require('./repository');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const getConversations = async (req, res) => {
  try {
    const conversations = await getConversationsByUser(req.user.id);
    sendSuccess(res, 'Conversations fetched', conversations);
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

module.exports = { getConversations, getMessages };
