import { useContext } from 'react';
import { SocketContext } from './socket.js';

const useSocket = () => useContext(SocketContext);

export default useSocket;
