import React from 'react';

const LandingPage = () => {
  return (
  <div className="min-h-screen bg-linear-to-br from-blue-600 to-indigo-800 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to Ted Chat 💬</h1>
      <p className="text-lg mb-6 text-center max-w-xl">
        Real-time messaging with global and private chat, reactions, typing indicators, and more.
      </p>
      <a
        href="/chat"
        className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition"
      >
        Enter Chat Room
      </a>
    </div>
  );
};

export default LandingPage;
