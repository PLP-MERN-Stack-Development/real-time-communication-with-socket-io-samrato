import React from 'react';
import { useSocket } from '../context/socketContext';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

const ConnectionStatus = () => {
  const { isConnected, connectionError } = useSocket();

  const handleRetry = () => {
    window.location.reload();
  };

  if (connectionError) {
    return (
      <div className="fixed top-4 right-4 max-w-sm">
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg border border-red-600">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle size={20} />
            <span className="font-semibold">Connection Error</span>
          </div>
          <p className="text-sm mb-3">{connectionError}</p>
          <button
            onClick={handleRetry}
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm ${
      isConnected 
        ? 'bg-green-500 text-white border border-green-600' 
        : 'bg-yellow-500 text-white border border-yellow-600'
    }`}>
      {isConnected ? (
        <>
          <Wifi size={16} />
          <span>Connected</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>Connecting...</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;