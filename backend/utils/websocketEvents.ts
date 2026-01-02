import { Server, Socket } from "socket.io";
import { sanitizeString } from "./sanitize";

interface VideoCallData {
  from: string;
  to: string;
  signalData: any;
}

export function registerSocketEvents(io: Server, socket: Socket) {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", (roomId: string) => {
    roomId = sanitizeString(roomId);
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("leaveRoom", (roomId: string) => {
    roomId = sanitizeString(roomId);
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  socket.on("chatMessage", ({ roomId, message, senderId }: any) => {
    roomId = sanitizeString(roomId);
    message = sanitizeString(message);
    socket.to(roomId).emit("receiveMessage", { roomId, message, senderId });
  });

  socket.on("callUser", (data: VideoCallData) => {
    const sanitizedData = {
      ...data,
      from: sanitizeString(data.from),
      to: sanitizeString(data.to),
    };
    io.to(sanitizedData.to).emit("incomingCall", sanitizedData);
  });

  socket.on("answerCall", (data: VideoCallData) => {
    io.to(data.from).emit("callAccepted", data.signalData);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
}
