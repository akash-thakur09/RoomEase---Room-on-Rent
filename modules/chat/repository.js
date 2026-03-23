const { Conversation, Message } = require('./model');

// Find existing conversation between two users, or create one
const findOrCreateConversation = async (userA, userB) => {
  let convo = await Conversation.findOne({ participants: { $all: [userA, userB] } });
  if (!convo) convo = await Conversation.create({ participants: [userA, userB] });
  return convo;
};

const getConversationsByUser = (userId) =>
  Conversation.find({ participants: userId }).populate('participants', 'name email');

const saveMessage = (data) => Message.create(data);

const getMessagesByConversation = (conversationId) =>
  Message.find({ conversationId }).sort({ createdAt: 1 }).populate('senderId', 'name email');

module.exports = { findOrCreateConversation, getConversationsByUser, saveMessage, getMessagesByConversation };
