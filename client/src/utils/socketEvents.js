// Socket event constants for frontend
export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  
  // Authentication
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  
  // Messaging
  SEND_MESSAGE: 'message:send',
  RECEIVE_MESSAGE: 'message:receive',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  
  // Typing indicators
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  // Rooms
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  ROOM_USERS: 'room:users',
  
  // Private messaging
  PRIVATE_MESSAGE: 'message:private',
  
  // Reactions
  ADD_REACTION: 'reaction:add',
  REMOVE_REACTION: 'reaction:remove',
  
  // File sharing
  FILE_UPLOAD: 'file:upload',
  
  // User status
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline'
};