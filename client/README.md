💬 Real-Time Chat Application

A full-stack real-time chat application built with Node.js, Express, React, and Socket.io featuring multiple rooms, private messaging, file sharing, and more.

https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Real-Time+Chat+Application
🚀 Features
✨ Core Features

    Real-time messaging with instant message delivery

    Multiple chat rooms (Global, Random, Help)

    Private direct messaging between users

    User authentication with username-based login

    Online user status with live user list

    Typing indicators showing when users are typing

🔥 Advanced Features

    File & image sharing with drag & drop support

    Message reactions with emoji reactions

    Read receipts and delivery status

    Notifications with browser and sound alerts

    Responsive design for all screen sizes

    Message persistence with MongoDB

📱 User Experience

    Fully responsive (mobile, tablet, desktop)

    Dark/Light mode ready UI

    Auto-reconnection with connection status

    Message history with pagination

    File upload with progress indicators

    ### 🎨 Theme Features
- **Light/Dark mode toggle** with smooth transitions
- **System preference detection** automatically uses your OS theme
- **Persistent theme selection** saved in local storage
- **Animated theme switching** with smooth color transitions
- **Dark-optimized components** with proper contrast ratios

🛠 Tech Stack
Backend

    Node.js - Runtime environment

    Express.js - Web framework

    Socket.io - Real-time communication

    MongoDB - Database for message persistence

    Mongoose - MongoDB object modeling

    CORS - Cross-origin resource sharing

Frontend

    React - UI framework with hooks

    Socket.io-client - Client-side WebSocket management

    TailwindCSS - Utility-first CSS framework

    Lucide React - Modern icon library

    Vite - Fast build tool and dev server

📁 Project Structure
text

chat-app/
├── server/                 # Backend application
│   ├── index.js           # Express + Socket.io server
│   ├── socketHandlers.js  # Socket event handlers
│   ├── models/
│   │   ├── Message.js     # Message schema
│   │   └── User.js        # User schema
│   └── package.json
└── client/                # Frontend application
    ├── src/
    │   ├── App.jsx        # Main React component
    │   ├── context/
    │   │   └── SocketContext.jsx  # Socket context provider
    │   ├── components/
    │   │   ├── ChatRoom.jsx       # Main chat interface
    │   │   ├── MessageList.jsx    # Messages display
    │   │   ├── TypingIndicator.jsx # Typing indicators
    │   │   └── PrivateChat.jsx    # Private chat windows
    │   └── utils/
    │       └── socketEvents.js    # Socket event constants
    └── package.json

🚀 Quick Start
Prerequisites

    Node.js (v16 or higher)

    MongoDB (local or Atlas)

    npm or yarn

Installation

    Clone the repository
    bash

git clone <repository-url>
cd chat-app

Setup Backend
bash

cd server
npm install

Setup Frontend
bash

cd ../client
npm install

Environment Configuration

Create server/.env:
env

PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
CLIENT_URL=http://localhost:3000
NODE_ENV=development

Create client/.env:
env

VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api

Start the Application

Terminal 1 - Backend:
bash

cd server
npm run dev

Terminal 2 - Frontend:
bash

cd client
npm run dev

    Access the Application

        Frontend: http://localhost:3000

        Backend API: http://localhost:5000

        Health Check: http://localhost:5000/api/health

🎯 Usage Guide
Joining the Chat

    Open http://localhost:3000 in your browser

    Enter a username (minimum 3 characters)

    Click "Join Chat" to enter the global room

Sending Messages

    Type in the message input and press Enter or click Send

    Use the paperclip icon to attach files (images, PDFs, documents)

    Maximum file size: 5MB

Room Navigation

    Global Chat: Main public room for all users

    Random Talk: Casual conversation room

    Help & Support: Technical support and questions

Private Messaging

    Click on any online user's name in the sidebar

    A private chat window will open

    Private messages are only visible to you and the recipient

Message Interactions

    Reactions: Click emoji reactions below others' messages

    Typing Indicators: See when others are typing

    Read Receipts: Checkmarks show message delivery status

🔌 API Endpoints
Socket Events
Authentication

    user:login - User authentication

    user:joined - User joined notification

    user:left - User left notification

Messaging

    message:send - Send a message

    message:receive - Receive a message

    typing:start - Start typing indicator

    typing:stop - Stop typing indicator

Rooms

    room:join - Join a chat room

    room:leave - Leave a chat room

    room:users - Get room users list

Private Messaging

    message:private - Send private message

    file:upload - Upload and share files

REST API
Health Check
http

GET /api/health

Returns server status and connection information.
Message History
http

GET /api/messages?room=global&page=1&limit=20

Retrieve paginated message history for a room.
🎨 Customization
Adding New Rooms

Edit the rooms state in ChatRoom.jsx:
javascript

const [rooms, setRooms] = useState([
  { id: 'global', name: 'Global Chat', users: [] },
  { id: 'random', name: 'Random Talk', users: [] },
  { id: 'help', name: 'Help & Support', users: [] },
  { id: 'new-room', name: 'New Room', users: [] } // Add your room here
]);

Modifying Message Reactions

Update the EMOJI_REACTIONS array in MessageList.jsx:
javascript

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'];

Styling Customization

The app uses TailwindCSS. Modify classes in components or extend the theme in tailwind.config.js.
🐛 Troubleshooting
Common Issues

    Connection Failed

        Ensure backend server is running on port 5000

        Check MongoDB connection

        Verify CORS configuration

    Messages Not Sending

        Check socket connection status

        Verify user authentication

        Check browser console for errors

    File Upload Fails

        Ensure file size < 5MB

        Check file type is allowed

        Verify network connection

    Private Messages Not Working

        Ensure both users are online

        Check recipient username is correct

        Verify socket events are properly handled

Debug Mode

Enable detailed logging by setting NODE_ENV=development in your server environment variables.
🔒 Security Features

    Input validation and sanitization

    CORS configuration for allowed origins

    File type and size validation

    XSS prevention through React's built-in protections

    Socket authentication and room isolation

📱 Browser Support

    Chrome/Edge 88+

    Firefox 78+

    Safari 14+

    Mobile browsers (iOS Safari, Chrome Mobile)

🚀 Deployment
Backend Deployment (Heroku/Railway)

    Set environment variables in your hosting platform

    Update CORS origins to your production domain

    Deploy with npm start

Frontend Deployment (Vercel/Netlify)

    Build the project: npm run build

    Deploy the dist folder

    Update environment variables for production

Environment Variables for Production
env

# Backend
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
CLIENT_URL=your_production_frontend_url
PORT=5000

# Frontend
VITE_SOCKET_URL=your_production_backend_url

🤝 Contributing

    Fork the repository

    Create a feature branch: git checkout -b feature/amazing-feature

    Commit your changes: git commit -m 'Add amazing feature'

    Push to the branch: git push origin feature/amazing-feature

    Open a Pull Request

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

    Socket.io for real-time communication

    TailwindCSS for utility-first CSS

    Lucide for beautiful icons

    React for the component-based architecture

📞 Support

If you encounter any issues or have questions:

    Check the Troubleshooting section

    Search existing GitHub Issues

    Create a new issue with detailed information