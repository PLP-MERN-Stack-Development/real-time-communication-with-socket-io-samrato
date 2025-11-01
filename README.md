
---

## 💬 Real-Time Chat Application

A full-stack real-time chat application built with **Node.js**, **Express**, **React**, and **Socket.io**, featuring multiple chat rooms, private messaging, file sharing, typing indicators, and much more.

![Chat Preview](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Real-Time+Chat+Application)

---

### 🚀 Objective

Build a **real-time chat system** demonstrating **bidirectional communication** between clients and server using **Socket.io**, with live messaging, notifications, and online status updates.

---

## ✨ Features

### 🧩 Core Features

* 💬 Real-time messaging with instant delivery
* 🏠 Multiple chat rooms (Global, Random, Help)
* 🔐 User authentication (username-based or JWT)
* 👥 Online user status tracking
* ⌨️ Typing indicators
* 🕒 Message timestamps

### 🔥 Advanced Features

* 📁 File & image sharing with drag-and-drop
* 😍 Message reactions (emoji reactions)
* ✅ Read receipts and delivery status
* 🔔 Browser and sound notifications
* 📱 Fully responsive design
* 🧠 Message persistence with MongoDB

### 🎨 Theme Features

* 🌗 Light/Dark mode toggle
* 💾 Theme preference saved in local storage
* 🎞️ Animated transitions between themes
* 🖥️ Adaptive color scheme for accessibility

---

## 🛠 Tech Stack

### **Backend**

* Node.js
* Express.js
* Socket.io
* MongoDB + Mongoose
* CORS

### **Frontend**

* React + Vite
* Socket.io-client
* Tailwind CSS
* Lucide React (icons)

---

## 📂 Project Structure

```
chat-app/
├── server/                 # Backend application
│   ├── index.js            # Express + Socket.io server
│   ├── socketHandlers.js   # Socket event handlers
│   ├── models/
│   │   ├── Message.js      # Message schema
│   │   └── User.js         # User schema
│   └── package.json
└── client/                 # Frontend application
    ├── src/
    │   ├── App.jsx         # Main React component
    │   ├── context/
    │   │   └── SocketContext.jsx
    │   ├── components/
    │   │   ├── ChatRoom.jsx
    │   │   ├── MessageList.jsx
    │   │   ├── TypingIndicator.jsx
    │   │   └── PrivateChat.jsx
    │   └── utils/socketEvents.js
    └── package.json
```

---

## ⚙️ Quick Start

### **Prerequisites**

* Node.js v16 or higher
* MongoDB (local or Atlas)
* npm or yarn

### **Installation**

```bash
# Clone the repository
git clone git@github.com:PLP-MERN-Stack-Development/real-time-communication-with-socket-io-samrato.git
cd chat-app
```

#### Backend Setup


```

---

## 🧾 Environment Variables

### **server/.env**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### **client/.env**

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running the App


```

**Access the app:**

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend API → [http://localhost:5000](http://localhost:5000)
* Health Check → [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🎯 Usage

### 🧑‍💻 Joining the Chat

1. Visit **[http://localhost:3000](http://localhost:3000)**
2. Enter a username (min 3 chars)
3. Join any room (Global, Random, Help)

### 💌 Messaging

* Send messages instantly
* Attach files (max 5MB)
* React to messages with emojis

### 🔒 Private Chats

* Click a username in the sidebar
* Chat privately in a dedicated window

### 🗂 Rooms

* Global Chat (everyone)
* Random Talk
* Help & Support

---

## 🧠 API & Socket Events

### **Authentication**

| Event         | Description              |
| ------------- | ------------------------ |
| `user:login`  | Authenticate user        |
| `user:joined` | User joined notification |
| `user:left`   | User left notification   |

### **Messaging**

| Event             | Description           |
| ----------------- | --------------------- |
| `message:send`    | Send a message        |
| `message:receive` | Receive a message     |
| `typing:start`    | Typing indicator      |
| `typing:stop`     | Stop typing indicator |

---

## 🧪 Expected Outcome

✅ Fully functional real-time chat app
✅ Smooth Socket.io bidirectional communication
✅ Multiple rooms and private chat support
✅ Responsive and visually polished UI
✅ Minimum 3 advanced features implemented

---

## 🐛 Troubleshooting

**Messages not sending?**

* Check socket connection & server logs

**File upload fails?**

* File size must be under 5MB

**No connection?**

* Verify `PORT`, `CORS`, and MongoDB setup

---

## 🔒 Security

* Input validation
* Sanitized message content
* File type and size validation
* Secure socket authentication

---

## 🚀 Deployment

### **Backend (Railway/Render/Heroku)**

* Set environment variables
* Deploy with:

  ```bash
  npm start
  ```

### **Frontend (Vercel/Netlify)**

* Build with:

  ```bash
  npm run build
  ```
* Deploy the `dist/` folder

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch

   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit and push changes

   ```bash
   git commit -m "Add amazing feature"
   git push origin feature/amazing-feature
   ```
4. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgments

* [Socket.io](https://socket.io)
* [TailwindCSS](https://tailwindcss.com)
* [Lucide Icons](https://lucide.dev)
* [React](https://react.dev)

---


