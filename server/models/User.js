import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  online: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  socketId: String
}, {
  timestamps: true
});

// Update lastSeen when user goes offline
userSchema.methods.setOffline = function() {
  this.online = false;
  this.lastSeen = new Date();
  return this.save();
};

export default mongoose.model('User', userSchema);