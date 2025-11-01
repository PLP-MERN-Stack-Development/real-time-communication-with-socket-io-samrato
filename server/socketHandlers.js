import { SOCKET_EVENTS } from './utils/socketEvents.js';
import Message from './models/Message.js';
import User from './models/User.js';

// Store active users and typing users
const activeUsers = new Map();
const typingUsers = new Map();

export const setupSocketHandlers = (io) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User authentication and joining
    socket.on(SOCKET_EVENTS.USER_LOGIN, async (username, callback) => {
      try {
        // Validate username
        if (!username || username.length < 3) {
          return callback({ success: false, error: 'Username must be at least 3 characters' });
        }

        // Check if username is already taken (online)
        if (Array.from(activeUsers.values()).includes(username)) {
          return callback({ success: false, error: 'Username is already taken' });
        }

        // Create or update user in database
        let user = await User.findOne({ username });
        if (!user) {
          user = new User({ username, online: true, socketId: socket.id });
        } else {
          user.online = true;
          user.socketId = socket.id;
        }
        await user.save();

  // Store user in active users map
  activeUsers.set(socket.id, username);
  socket.username = username;
  socket.userId = user._id.toString();

        // Join global room
        socket.join('global');

        // Notify all clients about new user
        socket.broadcast.emit(SOCKET_EVENTS.USER_JOINED, {
          username,
          onlineCount: activeUsers.size,
          timestamp: new Date()
        });

        // Send current online users to the new user
        const onlineUsers = Array.from(activeUsers.values());
        socket.emit(SOCKET_EVENTS.ROOM_USERS, {
          room: 'global',
          users: onlineUsers
        });

        // Load recent messages
        const recentMessages = await Message.find({ 
          $or: [
            { room: 'global' },
            { 'receiver.userId': user._id.toString() },
            { 'sender.userId': user._id.toString() }
          ],
          isDeleted: false
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

        callback({ 
          success: true, 
          user: { username, userId: user._id },
          messages: recentMessages.reverse()
        });

      } catch (error) {
        console.error('Login error:', error);
        callback({ success: false, error: 'Internal server error' });
      }
    });

    // Send message to room
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data, callback) => {
      try {
        const { content, room = 'global', receiver = null } = data;
        
        if (!content?.trim()) {
          return callback({ success: false, error: 'Message cannot be empty' });
        }

        const messageData = {
          content: content.trim(),
          sender: {
            username: socket.username,
            userId: socket.userId
          },
          room,
          messageType: 'text'
        };

        // Handle private messages
        if (receiver) {
          messageData.receiver = receiver;
          messageData.room = `private_${[socket.username, receiver.username].sort().join('_')}`;
        }

        const message = new Message(messageData);
        await message.save();

        // Emit to room or specific users for private messages
        if (receiver) {
          // Private message - send to both users
          const privateRoom = messageData.room;
          socket.to(privateRoom).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
          socket.emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
        } else {
          // Room message
          io.to(room).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
        }

        // Acknowledge message delivery
        if (callback) {
          callback({ 
            success: true, 
            messageId: message._id,
            timestamp: message.createdAt 
          });
        }

      } catch (error) {
        console.error('Message send error:', error);
        if (callback) {
          callback({ success: false, error: 'Failed to send message' });
        }
      }
    });

    // Typing indicators
    socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
      const { room = 'global', receiver = null } = data;
      
      typingUsers.set(socket.id, { username: socket.username, room, receiver });
      
      if (receiver && receiver.username) {
        // Private typing indicator - find socketId by username
        const targetSocketId = Array.from(activeUsers.entries()).find(([, name]) => name === receiver.username)?.[0];
        if (targetSocketId) {
          socket.to(targetSocketId).emit(SOCKET_EVENTS.TYPING_START, {
            username: socket.username,
            isTyping: true
          });
        }
      } else {
        // Room typing indicator
        socket.to(room).emit(SOCKET_EVENTS.TYPING_START, {
          username: socket.username,
          isTyping: true
        });
      }
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
      const { room = 'global', receiver = null } = data;
      
      typingUsers.delete(socket.id);
      
      if (receiver && receiver.username) {
        const targetSocketId = Array.from(activeUsers.entries()).find(([, name]) => name === receiver.username)?.[0];
        if (targetSocketId) {
          socket.to(targetSocketId).emit(SOCKET_EVENTS.TYPING_STOP, {
            username: socket.username,
            isTyping: false
          });
        }
      } else {
        socket.to(room).emit(SOCKET_EVENTS.TYPING_STOP, {
          username: socket.username,
          isTyping: false
        });
      }
    });

    // Join private chat
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (room) => {
      socket.join(room);
    });

    // Handle message reactions
    socket.on(SOCKET_EVENTS.ADD_REACTION, async (data) => {
      try {
        const { messageId, emoji } = data;
        const message = await Message.findById(messageId);
        
        if (message) {
          // Remove existing reaction from same user
          message.reactions = message.reactions.filter(
            r => r.userId !== socket.userId
          );
          
          // Add new reaction
          message.reactions.push({
            emoji,
            userId: socket.userId,
            username: socket.username
          });
          
          await message.save();
          
          // Broadcast updated message
          io.to(message.room).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
        }
      } catch (error) {
        console.error('Reaction error:', error);
      }
    });

    // Handle file upload
    socket.on(SOCKET_EVENTS.FILE_UPLOAD, async (data, callback) => {
      try {
        const { fileName, fileType, fileSize, data: fileData, room = 'global', receiver = null } = data;
        
        // Validate file size (max 5MB)
        if (fileSize > 5 * 1024 * 1024) {
          return callback({ success: false, error: 'File size too large (max 5MB)' });
        }

        const messageData = {
          content: `Shared file: ${fileName}`,
          sender: {
            username: socket.username,
            userId: socket.userId
          },
          room,
          messageType: 'file',
          fileData: {
            fileName,
            fileType,
            fileSize,
            data: fileData
          }
        };

        if (receiver) {
          messageData.receiver = receiver;
          messageData.room = `private_${[socket.username, receiver.username].sort().join('_')}`;
        }

        const message = new Message(messageData);
        await message.save();

        // Emit file message
        if (receiver) {
          const privateRoom = messageData.room;
          socket.to(privateRoom).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
          socket.emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
        } else {
          io.to(room).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
        }

        callback({ success: true, messageId: message._id });

      } catch (error) {
        console.error('File upload error:', error);
        callback({ success: false, error: 'File upload failed' });
      }
    });

    // Handle disconnection
    socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
      console.log(`User disconnected: ${socket.id}`);
      
      const username = activeUsers.get(socket.id);
      if (username) {
        activeUsers.delete(socket.id);
        typingUsers.delete(socket.id);

        // Update user status in database
        await User.findOneAndUpdate(
          { username },
          { online: false, lastSeen: new Date() }
        );

        // Notify other users
        socket.broadcast.emit(SOCKET_EVENTS.USER_LEFT, {
          username,
          onlineCount: activeUsers.size,
          timestamp: new Date()
        });
      }
    });
  });
};