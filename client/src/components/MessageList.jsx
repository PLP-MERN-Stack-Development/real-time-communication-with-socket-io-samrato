import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { SOCKET_EVENTS } from '../utils/socketEvents';
import { Smile, Download, CheckCheck } from 'lucide-react';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageList = ({ messages, currentRoom, onLoadMore }) => {
  const { socket, user } = useSocket();
  const { isDark } = useTheme();
  const messagesEndRef = useRef(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReaction = (messageId, emoji) => {
    if (socket) {
      socket.emit(SOCKET_EVENTS.ADD_REACTION, { messageId, emoji });
    }
  };

  const downloadFile = (fileData) => {
    const link = document.createElement('a');
    link.href = `data:${fileData.fileType};base64,${fileData.data}`;
    link.download = fileData.fileName;
    link.click();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isOwnMessage = (message) => {
    return message.sender.username === user?.username;
  };

  const renderFileMessage = (message) => {
    if (message.messageType !== 'file') return null;

    return (
      <div className={`mt-2 p-3 rounded-lg ${
        isDark ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {message.fileData.fileName}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {Math.round(message.fileData.fileSize / 1024)} KB • {message.fileData.fileType}
            </p>
          </div>
          <button
            onClick={() => downloadFile(message.fileData)}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
            }`}
          >
            <Download size={16} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>
      </div>
    );
  };

  const showRoomInfo = (message) => {
    if (message.room === currentRoom || !message.room) return null;
    
    return (
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
        in {message.room}
      </p>
    );
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-dark-200' : 'bg-gray-50'}`}>
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loadingMore ? 'Loading...' : 'Load Older Messages'}
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message._id || message.timestamp}
            className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
                isOwnMessage(message)
                  ? 'bg-blue-500 text-white'
                  : isDark 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-200 text-gray-800'
              }`}
            >
              {!isOwnMessage(message) && (
                <div className="mb-1">
                  <p className="text-xs font-semibold">
                    {message.sender.username}
                  </p>
                  {showRoomInfo(message)}
                </div>
              )}

              <p className="break-words">{message.content}</p>

              {renderFileMessage(message)}

              <div className={`flex items-center justify-between mt-2 text-xs ${
                isOwnMessage(message) 
                  ? 'text-blue-100' 
                  : isDark 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              }`}>
                <span>{formatTimestamp(message.createdAt || message.timestamp)}</span>
                
                {isOwnMessage(message) && (
                  <div className="flex items-center space-x-1">
                    <CheckCheck size={12} />
                    <span>Delivered</span>
                  </div>
                )}
              </div>

              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.reactions.map((reaction, index) => (
                    <span
                      key={index}
                      className={`text-xs rounded-full px-2 py-1 ${
                        isOwnMessage(message)
                          ? 'bg-white bg-opacity-20'
                          : isDark
                            ? 'bg-gray-600 text-gray-300'
                            : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {reaction.emoji} {reaction.username}
                    </span>
                  ))}
                </div>
              )}

              {!isOwnMessage(message) && (
                <div className="mt-2 flex space-x-1">
                  {EMOJI_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(message._id, emoji)}
                      className="hover:scale-110 transition-transform text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;