import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    console.log('🔌 Connecting to:', socketUrl);
    setIsConnecting(true);
    setConnectionError(null);

    // Create socket with explicit configuration
    const newSocket = io(socketUrl, {
      // Force WebSocket first, then fallback to polling
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      // Important: force new connection
      forceNew: true,
      // Add query parameters for debugging
      query: {
        clientType: 'web',
        version: '1.0.0'
      }
    });

    setSocket(newSocket);

    // Connection successful
    newSocket.on('connect', () => {
      console.log('✅ Connected to server! Socket ID:', newSocket.id);
      console.log('🔗 Transport:', newSocket.io.engine.transport.name);
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      
      // Test the connection immediately
      setTimeout(() => {
        newSocket.emit('test:message', 
          { test: 'Hello from client', timestamp: Date.now() }, 
          (response) => {
            if (response) {
              console.log('✅ Server test successful:', response);
            }
          }
        );
      }, 100);
    });

    newSocket.on('connected', (data) => {
      console.log('✅ Server welcome:', data);
      addNotification('Connected to chat server!', 'success');
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('🔥 Connection error details:', {
        message: error.message,
        type: error.type,
        description: error.description
      });
      
      setIsConnected(false);
      setIsConnecting(false);
      
      let errorMessage = 'Cannot connect to server. ';
      
      if (error.message.includes('timeout')) {
        errorMessage += 'Server is not responding. ';
      } else if (error.message.includes('websocket error')) {
        errorMessage += 'WebSocket connection failed. ';
      }
      
      errorMessage += 'Make sure the server is running on port 5000.';
      setConnectionError(errorMessage);
    });

    // Handle disconnection
    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected. Reason:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server forced disconnect
        setConnectionError('Server disconnected you. Please refresh.');
      }
    });

    // Handle reconnection events
    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnecting... Attempt ${attempt}`);
      setIsConnecting(true);
    });

    newSocket.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('💥 All reconnection attempts failed');
      setIsConnecting(false);
      setConnectionError('Unable to reconnect. Please refresh the page.');
    });

    // Handle custom events
    newSocket.on('user:joined', (data) => {
      console.log('👤 User joined:', data.username);
      addNotification(`${data.username} joined the chat`, 'info');
    });

    newSocket.on('message:receive', (message) => {
      console.log('💬 New message:', message);
    });

    // Transport upgrades
    newSocket.io.engine.on('upgrade', (transport) => {
      console.log('🔄 Transport upgraded to:', transport.name);
    });

    // Manual connection
    newSocket.connect();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, []);

  const addNotification = (message, type = 'info') => {
    const id = Date.now().toString();
    const notification = { id, message, type, timestamp: new Date() };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const login = (username) => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        return reject(new Error('Not connected to server. Please check connection.'));
      }

      console.log('👤 Attempting login with:', username);
      
      socket.emit('user:login', username, (response) => {
        console.log('📨 Login response:', response);
        
        if (response?.success) {
          setUser(response.user);
          socket.userId = response.user.userId;
          socket.username = username;
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Login failed. Please try again.'));
        }
      });
    });
  };

  const logout = () => {
    if (socket) {
      socket.disconnect();
    }
    setUser(null);
    setOnlineUsers([]);
    setNotifications([]);
    setConnectionError(null);
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    user,
    notifications,
    connectionError,
    isConnecting,
    login,
    logout,
    addNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};