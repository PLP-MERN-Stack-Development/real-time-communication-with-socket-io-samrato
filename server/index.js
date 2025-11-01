import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
// Enhanced Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
  },
  // Critical WebSocket settings
  transports: ['websocket', 'polling'], // Explicitly enable both
  allowUpgrades: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 10000,
  // Add these for better WebSocket handling
  allowEIO3: true, // Allow Engine.IO v3 compatibility
  cookie: false
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    onlineUsers: io.engine.clientsCount,
    socketConnections: Array.from(io.sockets.sockets).length,
    uptime: process.uptime()
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  console.log('🔗 Transport:', socket.conn.transport.name);

  // Send immediate welcome message
  socket.emit('connected', { 
    message: 'Successfully connected to chat server',
    socketId: socket.id,
    timestamp: new Date().toISOString()
  });

  // Handle test messages
  socket.on('test:message', (data, callback) => {
    console.log('📨 Test message received:', data);
    if (callback) {
      callback({ 
        success: true, 
        message: 'Server is working!',
        received: data,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle user login
  socket.on('user:login', (username, callback) => {
    console.log('👤 Login attempt:', username);
    
    // Simple validation
    if (!username || username.length < 3) {
      return callback({ 
        success: false, 
        error: 'Username must be at least 3 characters' 
      });
    }

    // Simulate successful login
    const userData = {
      success: true,
      user: {
        username: username,
        userId: socket.id,
        joinedAt: new Date().toISOString()
      },
      message: `Welcome ${username}!`
    };

    console.log('✅ Login successful for:', username);
    callback(userData);

    // Broadcast user joined
    socket.broadcast.emit('user:joined', {
      username: username,
      timestamp: new Date().toISOString()
    });
  });

  // Handle chat messages
  socket.on('message:send', (data, callback) => {
    console.log('💬 Message received:', data);
    
    const message = {
      _id: Date.now().toString(),
      content: data.content,
      sender: {
        username: data.sender || 'Anonymous',
        userId: socket.id
      },
      timestamp: new Date().toISOString(),
      room: data.room || 'global'
    };

    // Broadcast to all connected clients
    io.emit('message:receive', message);
    
    if (callback) {
      callback({ 
        success: true, 
        messageId: message._id,
        timestamp: message.timestamp
      });
    }
  });

  // Handle typing indicators
  socket.on('typing:start', (data) => {
    socket.broadcast.emit('typing:start', {
      username: data.username || 'Someone',
      isTyping: true
    });
  });

  socket.on('typing:stop', (data) => {
    socket.broadcast.emit('typing:stop', {
      username: data.username || 'Someone',
      isTyping: false
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('❌ Client disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle transport upgrades
  socket.conn.on('upgrade', (transport) => {
    console.log('🔄 Transport upgraded to:', transport.name);
  });

  socket.conn.on('close', (reason) => {
    console.log('🔒 Connection closed:', reason);
  });
});

// Socket.io engine events
io.engine.on('connection_error', (err) => {
  console.error('🚨 Socket.io engine error:', err);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔌 Socket.io: ws://localhost:${PORT}`);
  console.log(`📡 Transports: websocket, polling`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});