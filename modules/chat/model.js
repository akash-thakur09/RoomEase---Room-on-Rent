const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:           { type: String, required: true },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message      = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };
