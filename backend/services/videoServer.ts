
import { Server } from "socket.io";
import VideoSession from "../models/VideoSession";

export function initVideoServer(server: any, authenticate: any) {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use(authenticate); 

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    
    socket.on("join-room", ({ roomId, userId }) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });
    });

    
    socket.on("call-user", async ({ from, to }) => {
      try {
        const session = await VideoSession.create({
          caller: from,
          callee: to,
          status: "ongoing",
        });
        socket.to(to).emit("incoming-call", { from, sessionId: session._id });
      } catch (err) {
        console.error(err);
      }
    });

   
    socket.on("answer-call", ({ sessionId, answer }) => {
      io.to(sessionId.toString()).emit("call-answered", { answer });
    });

    
    socket.on("ice-candidate", ({ to, candidate }) => {
      socket.to(to).emit("ice-candidate", candidate);
    });

   
    socket.on("end-call", async ({ sessionId }) => {
      await VideoSession.findByIdAndUpdate(sessionId, {
        status: "ended",
        endedAt: new Date(),
      });
      io.to(sessionId.toString()).emit("call-ended");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}
