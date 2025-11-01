import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  emoji: String,
  userId: String,
  username: String
});

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    username: String,
    userId: String
  },
  receiver: {
    username: String,
    userId: String
  },
  room: {
    type: String,
    default: 'global'
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  fileData: {
    fileName: String,
    fileType: String,
    fileSize: Number,
    data: String // base64 encoded
  },
  readBy: [{
    userId: String,
    username: String,
    readAt: Date
  }],
  reactions: [reactionSchema],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ 'sender.userId': 1, 'receiver.userId': 1 });

export default mongoose.model('Message', messageSchema);