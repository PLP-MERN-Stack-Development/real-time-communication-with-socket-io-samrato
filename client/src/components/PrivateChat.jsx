import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/socketContext';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import { Send, Paperclip, X } from 'lucide-react';

const PrivateChat = ({ recipient, onClose }) => {
  const { socket, user } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fileUpload, setFileUpload] = useState(null);

  useEffect(() => {
    if (!socket || !recipient) return;

    // Join private room
    const privateRoom = `private_${[user.username, recipient].sort().join('_')}`;
    socket.emit('room:join', privateRoom);

    // Load private message history
    const loadPrivateMessages = async () => {
      try {
        const response = await fetch(`/api/messages?room=${privateRoom}`);
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error loading private messages:', error);
      }
    };

    loadPrivateMessages();

    // Private message listener
    const handlePrivateMessage = (message) => {
      if (message.sender.username === recipient || 
          (message.receiver && message.receiver.username === recipient)) {
        setMessages(prev => [...prev, message]);
      }
    };

    socket.on('message:receive', handlePrivateMessage);

    return () => {
      socket.off('message:receive', handlePrivateMessage);
    };
  }, [socket, user, recipient]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !fileUpload) return;

    const messageData = {
      content: newMessage.trim(),
      receiver: {
        username: recipient,
        userId: null // Would be fetched from user list in production
      }
    };

    if (fileUpload) {
      // Handle file upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          fileName: fileUpload.name,
          fileType: fileUpload.type,
          fileSize: fileUpload.size,
          data: e.target.result.split(',')[1], // Remove data URL prefix
          receiver: {
            username: recipient,
            userId: null
          }
        };

        socket.emit('file:upload', fileData, (response) => {
          if (response.success) {
            setFileUpload(null);
          }
        });
      };
      reader.readAsDataURL(fileUpload);
    } else {
      // Send text message
      socket.emit('message:send', messageData, (response) => {
        if (response.success) {
          setNewMessage('');
          stopTyping();
        }
      });
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing:start', { receiver: { username: recipient } });
    }
  };

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      socket.emit('typing:stop', { receiver: { username: recipient } });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setFileUpload(file);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Chat with {recipient}</h3>
          <p className="text-xs opacity-80">Private conversation</p>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-blue-600 rounded-full p-1"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} currentRoom={`private_${recipient}`} />
        <TypingIndicator />
      </div>

      {/* File preview */}
      {fileUpload && (
        <div className="px-3 py-2 bg-yellow-50 border-t flex items-center justify-between">
          <span className="text-sm truncate flex-1">{fileUpload.name}</span>
          <button
            onClick={() => setFileUpload(null)}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t">
        <div className="flex space-x-2">
          <label className="cursor-pointer p-2 hover:bg-gray-100 rounded">
            <Paperclip size={20} className="text-gray-500" />
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
            />
          </label>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onBlur={stopTyping}
            placeholder="Type a private message..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() && !fileUpload}
            className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivateChat;