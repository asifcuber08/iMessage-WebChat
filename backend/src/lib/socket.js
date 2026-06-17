import express from "express";
import http from "http";
import { Server } from "socket.io";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, { cors: { origin: [allowedOrigin] } });

function getReceiverSocketIds(userId) {
  return Array.from(userSocketMap[userId] || []);
}

function getReceiverSocketId(userId) {
  return getReceiverSocketIds(userId)[0];
}

// online users map = { userId: Set(socketId) }
const userSocketMap = {};

function getOnlineUserIds() {
  return Object.keys(userSocketMap).filter((userId) => userSocketMap[userId]?.size);
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    if (!userSocketMap[userId]) userSocketMap[userId] = new Set();
    userSocketMap[userId].add(socket.id);
    User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(() => {});
  }

  // io.emit() sends event to everyone - broadcast
  io.emit("getOnlineUsers", getOnlineUserIds());

  socket.on("typing:start", ({ receiverId } = {}) => {
    if (!userId || !receiverId) return;

    getReceiverSocketIds(receiverId).forEach((socketId) => {
      io.to(socketId).emit("userTyping", { senderId: userId, isTyping: true });
    });
  });

  socket.on("typing:stop", ({ receiverId } = {}) => {
    if (!userId || !receiverId) return;

    getReceiverSocketIds(receiverId).forEach((socketId) => {
      io.to(socketId).emit("userTyping", { senderId: userId, isTyping: false });
    });
  });

  // socket.on is used to listen for events
  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
        User.findByIdAndUpdate(userId, { lastSeen: new Date() }).catch(() => {});
      }
    }

    io.emit("getOnlineUsers", getOnlineUserIds());
  });
});

export { app, server, io, getReceiverSocketId, getReceiverSocketIds };
