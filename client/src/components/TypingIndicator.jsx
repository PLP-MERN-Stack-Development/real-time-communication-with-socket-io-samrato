import React from 'react';
import { useSocket } from '../context/socketContext';

const TypingIndicator = () => {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = React.useState([]);

  React.useEffect(() => {
    if (!socket) return;

    const handleTypingStart = (data) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    };

    const handleTypingStop = (data) => {
      setTypingUsers(prev => prev.filter(user => user !== data.username));
    };

    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket]);

  if (typingUsers.length === 0) return null;

  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic">
      {typingUsers.length === 1 
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.join(', ')} are typing...`
      }
      <span className="inline-block ml-2 animate-bounce">...</span>
    </div>
  );
};

export default TypingIndicator;