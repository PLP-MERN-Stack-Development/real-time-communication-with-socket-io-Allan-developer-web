// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));

// Store connected users and messages
const connectedUsers = {};
const typingUsers = {};

// Socket.io connection handler with authentication
io.on('connection', async (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', async (token) => {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        socket.emit('auth_error', { message: 'Invalid authentication' });
        return;
      }

      // Update user status
      user.isOnline = true;
      user.socketId = socket.id;
      await user.save();

      // Store user in connected users
      connectedUsers[socket.id] = { 
        id: user._id, 
        username: user.username,
        socketId: socket.id 
      };

      // Join a room for private messages
      socket.join(user._id.toString());

      // Notify others
      io.emit('user_list', await User.find({ isOnline: true }, 'username _id'));
      io.emit('user_joined', { username: user.username, id: user._id });
      
      console.log(`${user.username} authenticated and joined`);
    } catch (error) {
      socket.emit('auth_error', { message: 'Invalid authentication' });
    }
  });

  // Handle chat messages
  socket.on('send_message', async (messageData) => {
    try {
      if (!connectedUsers[socket.id]) {
        socket.emit('auth_error', { message: 'Authentication required' });
        return;
      }

      const message = new Message({
        content: messageData.message,
        sender: connectedUsers[socket.id].username,
        senderId: connectedUsers[socket.id].id,
        timestamp: new Date()
      });
      
      await message.save();
      
      io.emit('receive_message', {
        id: message._id,
        message: message.content,
        sender: message.sender,
        senderId: message.senderId,
        timestamp: message.timestamp.toISOString()
      });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Error saving message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (connectedUsers[socket.id]) {
      const username = connectedUsers[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', async ({ to, message }) => {
    try {
      if (!connectedUsers[socket.id]) {
        socket.emit('auth_error', { message: 'Authentication required' });
        return;
      }

      const messageData = new Message({
        content: message,
        sender: connectedUsers[socket.id].username,
        senderId: connectedUsers[socket.id].id,
        recipient: to,
        isPrivate: true,
        timestamp: new Date()
      });
      
      await messageData.save();
      
      const response = {
        id: messageData._id,
        message: messageData.content,
        sender: messageData.sender,
        senderId: messageData.senderId,
        timestamp: messageData.timestamp.toISOString(),
        isPrivate: true
      };
      
      socket.to(to).emit('private_message', response);
      socket.emit('private_message', response);
    } catch (error) {
      console.error('Error saving private message:', error);
      socket.emit('error', { message: 'Error saving private message' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    if (connectedUsers[socket.id]) {
      const { username, id } = connectedUsers[socket.id];
      
      // Update user status in database
      try {
        const user = await User.findById(id);
        if (user) {
          user.isOnline = false;
          user.lastSeen = new Date();
          await user.save();
        }
      } catch (error) {
        console.error('Error updating user status:', error);
      }

      io.emit('user_left', { username, id });
      console.log(`${username} left the chat`);
    }
    
    delete connectedUsers[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', await User.find({ isOnline: true }, 'username _id'));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find({ isPrivate: false })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

app.get('/api/messages/private/:userId', async (req, res) => {
  try {
    const messages = await Message.find({
      isPrivate: true,
      $or: [
        { senderId: req.params.userId },
        { recipient: req.params.userId }
      ]
    }).sort({ timestamp: -1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching private messages' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username isOnline lastSeen');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 