import React, { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from './context/socketContext';
import ChatRoom from './components/ChatRoom';
import ConnectionStatus from './components/ConnectionStatus';
import { Wifi, WifiOff, X, RefreshCw } from 'lucide-react';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onLogin(username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Ted Chat
          </h1>
          <p className="text-gray-600">
            Join the conversation in real-time
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Choose a username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              minLength={3}
              maxLength={20}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || username.length < 3}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin mr-2" />
                Joining...
              </>
            ) : (
              'Join Chat'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By joining, you agree to our community guidelines</p>
        </div>
      </div>
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications } = useSocket();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 space-y-2 z-50 max-w-md w-full px-4">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`px-6 py-3 rounded-lg shadow-lg border backdrop-blur-sm w-full ${
            notification.type === 'error' 
              ? 'bg-red-500 text-white border-red-600'
              : notification.type === 'message'
              ? 'bg-blue-500 text-white border-blue-600'
              : 'bg-green-500 text-white border-green-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const AppContent = () => {
  const { user, login, logout, isConnected, connectionError } = useSocket();

  // Show connection error overlay
  if (connectionError && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <WifiOff size={48} className="mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Connection Failed
            </h1>
            <p className="text-gray-600 mb-4">
              {connectionError}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps:</h3>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>Verify your internet connection</li>
                <li>Try refreshing the page</li>
              </ol>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center"
            >
              <RefreshCw size={18} className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div className="h-screen flex flex-col">
      <ConnectionStatus />
      <NotificationContainer />
      <ChatRoom />
    </div>
  );
};

function App() {
  return (
    <SocketProvider>
      <AppContent />
    </SocketProvider>
  );
}

export default App;