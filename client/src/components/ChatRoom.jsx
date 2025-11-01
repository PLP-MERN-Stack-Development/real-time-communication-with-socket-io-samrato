import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import PrivateChat from './PrivateChat';
import ThemeToggle from './ThemeToggle';
import { 
  Send, 
  Paperclip, 
  Users, 
  Bell, 
  BellOff, 
  MessageCircle, 
  Menu, 
  X,
  Hash
} from 'lucide-react';

const ChatRoom = () => {
  const { socket, user, onlineUsers, addNotification, isConnected } = useSocket();
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fileUpload, setFileUpload] = useState(null);
  const [activePrivateChats, setActivePrivateChats] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentRoom, setCurrentRoom] = useState('global');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rooms, setRooms] = useState([
    { id: 'global', name: 'Global Chat', users: [] },
    { id: 'random', name: 'Random Talk', users: [] },
    { id: 'help', name: 'Help & Support', users: [] }
  ]);
  
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && window.innerWidth < 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !sidebar.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Auto-close sidebar on room change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [currentRoom]);

  // Load messages when room changes or connection established
  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('🎯 Loading messages for room:', currentRoom);

    // Join the current room
    socket.emit('room:join', currentRoom);

    // Load initial messages for the room
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/messages?room=${currentRoom}`);
        const data = await response.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      }
    };

    loadMessages();

    // Message listener
    const handleNewMessage = (message) => {
      if (message.room === currentRoom || 
          message.receiver?.username === user?.username ||
          message.sender.username === user?.username) {
        setMessages(prev => [...prev, message]);
        
        if (message.sender.username !== user?.username && notificationsEnabled) {
          addNotification(`New message from ${message.sender.username} in ${message.room}`, 'message');
        }
      }
    };

    socket.on('message:receive', handleNewMessage);

    // Room users update
    const handleRoomUsers = (data) => {
      if (data.room === currentRoom) {
        setRooms(prev => prev.map(room => 
          room.id === data.room ? { ...room, users: data.users } : room
        ));
      }
    };

    socket.on('room:users', handleRoomUsers);

    return () => {
      socket.off('message:receive', handleNewMessage);
      socket.off('room:users', handleRoomUsers);
    };
  }, [socket, isConnected, currentRoom, user, notificationsEnabled, addNotification]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !fileUpload) return;

    if (!socket || !isConnected) {
      addNotification('Not connected to server', 'error');
      return;
    }

    const messageData = {
      content: newMessage.trim(),
      room: currentRoom,
      sender: user?.username
    };

    if (fileUpload) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          fileName: fileUpload.name,
          fileType: fileUpload.type,
          fileSize: fileUpload.size,
          data: e.target.result.split(',')[1],
          room: currentRoom
        };

        socket.emit('file:upload', fileData, (response) => {
          if (response?.success) {
            setFileUpload(null);
            addNotification('File sent successfully', 'success');
          } else {
            addNotification('Failed to send file', 'error');
          }
        });
      };
      reader.readAsDataURL(fileUpload);
    } else {
      socket.emit('message:send', messageData, (response) => {
        if (response?.success) {
          setNewMessage('');
          stopTyping();
        } else {
          addNotification('Failed to send message', 'error');
        }
      });
    }
  };

  const handleTyping = () => {
    if (!isTyping && socket && isConnected) {
      setIsTyping(true);
      socket.emit('typing:start', { room: currentRoom });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const stopTyping = () => {
    if (isTyping && socket && isConnected) {
      setIsTyping(false);
      socket.emit('typing:stop', { room: currentRoom });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification('File size must be less than 5MB', 'error');
        return;
      }
      setFileUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const startPrivateChat = (username) => {
    if (username !== user?.username && !activePrivateChats.includes(username)) {
      setActivePrivateChats(prev => [...prev, username]);
      addNotification(`Started private chat with ${username}`, 'info');
    }
  };

  const closePrivateChat = (username) => {
    setActivePrivateChats(prev => prev.filter(u => u !== username));
  };

  const changeRoom = (roomId) => {
    if (roomId !== currentRoom) {
      setCurrentRoom(roomId);
      setMessages([]);
      addNotification(`Joined ${roomId} room`, 'info');
      
      if (socket && isConnected) {
        socket.emit('room:join', roomId);
      }
    }
  };

  const loadOlderMessages = async () => {
    try {
      const currentMessagesLength = messages.length;
      const page = Math.ceil(currentMessagesLength / 20) + 1;
      
      const response = await fetch(`/api/messages?room=${currentRoom}&page=${page}&limit=20`);
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        setMessages(prev => [...data.messages, ...prev]);
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
    }
  };

  const currentRoomUsers = rooms.find(room => room.id === currentRoom)?.users || [];

  // Theme classes
  const bgPrimary = isDark ? 'bg-dark-200' : 'bg-gray-100';
  const bgSecondary = isDark ? 'bg-dark-100' : 'bg-white';
  const bgTertiary = isDark ? 'bg-dark-300' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-dark-300' : 'hover:bg-gray-50';

  // Mobile sidebar overlay
  const sidebarOverlay = sidebarOpen && (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  );

  return (
    <div className={`flex h-screen ${bgPrimary} relative transition-colors duration-300`}>
      {/* Mobile Header */}
      <div className={`md:hidden fixed top-0 left-0 right-0 ${bgSecondary} border-b ${borderColor} z-30 p-4 transition-colors duration-300`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 ${hoverBg} rounded-lg transition-colors duration-200`}
            >
              {sidebarOpen ? <X size={20} className={textPrimary} /> : <Menu size={20} className={textPrimary} />}
            </button>
            <div>
              <h1 className={`text-lg font-bold ${textPrimary}`}>Chat App</h1>
              <div className={`flex items-center space-x-2 text-sm ${textSecondary}`}>
                <Hash size={14} />
                <span>{rooms.find(r => r.id === currentRoom)?.name || currentRoom}</span>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                notificationsEnabled 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : `${bgTertiary} ${textSecondary} ${hoverBg}`
              }`}
            >
              {notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOverlay}

      {/* Sidebar */}
      <div className={`
        sidebar fixed md:static inset-y-0 left-0 z-50
        w-64 ${bgSecondary} border-r ${borderColor} flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-colors duration-300
      `}>
        {/* Desktop Header */}
        <div className={`p-4 border-b ${borderColor} hidden md:block transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-xl font-bold ${textPrimary}`}>Chat App</h1>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${textSecondary}`}>
              Welcome, <strong className={textPrimary}>{user?.username}</strong>
            </p>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`p-1 rounded transition-colors ${
                notificationsEnabled 
                  ? 'text-blue-500 hover:bg-blue-500 hover:bg-opacity-10' 
                  : `${textSecondary} ${hoverBg}`
              }`}
              title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
          </div>
        </div>

        {/* Online Users */}
        <div className={`p-4 border-b ${borderColor} transition-colors duration-300`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className={`font-semibold ${textPrimary}`}>Online Users</h2>
            <Users size={16} className={textSecondary} />
          </div>
          <div className="space-y-1 max-h-40 md:max-h-60 overflow-y-auto">
            {onlineUsers.map((username) => (
              <div
                key={username}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors duration-200 ${
                  username === user?.username 
                    ? 'bg-blue-500 bg-opacity-20 text-blue-600' 
                    : `${hoverBg} ${textPrimary}`
                }`}
                onClick={() => startPrivateChat(username)}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm truncate">{username}</span>
                  {username === user?.username && (
                    <span className="text-xs text-blue-500 ml-1">(you)</span>
                  )}
                </div>
                {username !== user?.username && (
                  <MessageCircle size={14} className="text-blue-500 flex-shrink-0" />
                )}
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <p className={`text-sm ${textSecondary} text-center py-2`}>No users online</p>
            )}
          </div>
        </div>

        {/* Rooms */}
        <div className="p-4 flex-1">
          <h3 className={`font-semibold ${textPrimary} mb-2`}>Rooms</h3>
          <div className="space-y-1">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => changeRoom(room.id)}
                className={`p-3 rounded cursor-pointer transition-all duration-200 ${
                  currentRoom === room.id
                    ? 'bg-blue-500 text-white shadow-md transform scale-105'
                    : `${hoverBg} ${textPrimary} hover:shadow-sm`
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate"># {room.name}</span>
                  {room.users.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      currentRoom === room.id 
                        ? 'bg-blue-400 text-white' 
                        : isDark 
                          ? 'bg-dark-300 text-gray-300' 
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {room.users.length}
                    </span>
                  )}
                </div>
                {currentRoom === room.id && room.users.length > 0 && (
                  <div className={`text-xs mt-1 ${
                    currentRoom === room.id ? 'text-blue-100' : textSecondary
                  } truncate`}>
                    Online: {room.users.slice(0, 3).join(', ')}
                    {room.users.length > 3 && ` +${room.users.length - 3} more`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        <div className={`p-4 border-t ${borderColor} transition-colors duration-300`}>
          <div className={`flex items-center space-x-2 text-sm ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col md:mt-0 mt-16">
        {/* Desktop Room Header */}
        <div className={`${bgSecondary} border-b ${borderColor} p-4 hidden md:block transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-semibold ${textPrimary}`}>
                # {rooms.find(r => r.id === currentRoom)?.name || currentRoom}
              </h2>
              <p className={`text-sm ${textSecondary}`}>
                {currentRoomUsers.length > 0 
                  ? `${currentRoomUsers.length} users online` 
                  : 'No users in room'
                }
              </p>
            </div>
            <div className={`text-sm ${textSecondary}`}>
              {isConnected ? '🟢 Live' : '🔴 Offline'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageList 
            messages={messages} 
            currentRoom={currentRoom}
            onLoadMore={loadOlderMessages}
          />
          <TypingIndicator />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className={`p-4 border-t ${bgSecondary} ${borderColor} transition-colors duration-300`}>
          {/* File preview */}
          {fileUpload && (
            <div className={`mb-2 p-2 rounded flex items-center justify-between ${
              isDark ? 'bg-yellow-900 bg-opacity-20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <span className={`text-sm truncate flex-1 ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
                {fileUpload.name}
              </span>
              <button
                type="button"
                onClick={() => setFileUpload(null)}
                className="text-red-500 hover:text-red-700 ml-2 text-sm flex-shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
            
            <button
              type="button"
              onClick={triggerFileInput}
              className={`p-2 ${hoverBg} rounded-lg border ${borderColor} transition-colors duration-200 flex-shrink-0`}
            >
              <Paperclip size={20} className={textSecondary} />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onBlur={stopTyping}
              placeholder={`Message #${currentRoom}...`}
              className={`flex-1 border ${borderColor} rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 min-w-0 ${
                isDark 
                  ? 'bg-dark-300 text-white placeholder-gray-400' 
                  : 'bg-white text-gray-800 placeholder-gray-500'
              }`}
              disabled={!isConnected}
            />
            
            <button
              type="submit"
              disabled={(!newMessage.trim() && !fileUpload) || !isConnected}
              className="bg-blue-500 text-white rounded-lg px-4 md:px-6 py-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2 flex-shrink-0"
            >
              <Send size={18} />
              <span className="hidden md:inline">Send</span>
            </button>
          </div>
        </form>
      </div>

      {/* Private Chat Windows */}
      {activePrivateChats.map((recipient) => (
        <PrivateChat
          key={recipient}
          recipient={recipient}
          onClose={() => closePrivateChat(recipient)}
        />
      ))}
    </div>
  );
};

export default ChatRoom;