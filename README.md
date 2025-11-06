# Real-Time Chat Application with Socket.io

A full-featured real-time chat application built with React, Node.js, Socket.io, and MongoDB. This application supports user authentication, real-time messaging, typing indicators, and more.

## Features

- Real-time messaging using Socket.io
- User authentication with JWT
- Typing indicators
- Message history
- Online/offline status
- Responsive design

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/PLP-MERN-Stack-Development/real-time-communication-with-socket-io-Allan-developer-web.git
cd real-time-communication-with-socket-io-Allan-developer-web
```

### 2. Server Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_jwt_secret_here
```

4. Required Server Dependencies:
- express
- socket.io
- mongoose
- jsonwebtoken
- bcryptjs
- dotenv
- cors

### 3. Client Setup

1. Open a new terminal and navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Required Client Dependencies:
- react
- react-dom
- socket.io-client
- axios
- @mui/material
- @emotion/react
- @emotion/styled
- @mui/icons-material

## Running the Application

### 1. Start MongoDB
Make sure MongoDB is running on your system. If it's not running, start it:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo service mongod start
```

### 2. Start the Server

1. In the server directory:
```bash
cd server
npm start
```
The server will start on http://localhost:5000

### 3. Start the Client

1. In a new terminal, navigate to the client directory:
```bash
cd client
npm run dev
```
The client will start on http://localhost:5174 (or another port if 5174 is in use)

## Project Structure

```
├── client/                 # React front-end
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── socket.js      # Socket.io client configuration
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                 # Node.js back-end
│   ├── server.js          # Main server file
│   ├── middleware/        # Authentication middleware
│   └── package.json
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Messages
- GET `/api/messages` - Get chat history
- POST `/api/messages` - Send a new message

## Socket.io Events

### Client Events
- `join` - Join the chat room
- `message` - Send a message
- `typing` - Indicate user is typing
- `stop typing` - Indicate user stopped typing

### Server Events
- `message` - Receive a message
- `userJoined` - New user joined notification
- `typing` - User is typing notification
- `stop typing` - User stopped typing notification

## Troubleshooting

1. **Server Connection Issues**
   - Check if MongoDB is running
   - Verify the MongoDB connection string in `.env`
   - Ensure port 5000 is not in use

2. **Client Connection Issues**
   - Check if the server is running
   - Verify the Socket.io connection URL in `socket.js`
   - Check browser console for errors

3. **Authentication Issues**
   - Ensure JWT_SECRET is set in `.env`
   - Check if the token is being sent in requests
   - Verify token expiration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 