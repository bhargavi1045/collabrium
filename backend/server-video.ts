import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import { registerSocketEvents } from "./utils/websocketEvents"; 

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

const sanitize = (str: string) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  registerSocketEvents(io, socket);

  socket.on("join-room", (roomId: string, userId: string) => {
    roomId = sanitize(roomId);
    userId = sanitize(userId);

    socket.join(roomId);
    socket.to(roomId).emit("user-joined", userId);

    socket.on("signal", (data: any) => {
      socket.to(roomId).emit("signal", data);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-left", userId);
    });
  });
});

server.listen(8001, () => {
  console.log("Video server running on port 8001");
});
