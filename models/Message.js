const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Number, required: true },
  read: { type: Boolean, default: false },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
