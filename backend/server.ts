import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import { connectDB } from "./connection";
import userRouter from "./routes/userRoutes";
import roomRouter from "./routes/roomRoutes";
import noteRouter from "./routes/noteRoutes";
import challengeRouter from "./routes/challengeRoutes";
import aiRouter from "./routes/aiRoutes";
import authRouter from "./routes/authRoutes";
import gameRouter from "./routes/gamificationRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const mongoURL = process.env.MONGO_URI;

connectDB(mongoURL);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/notes", noteRouter);
app.use("/api/challenges", challengeRouter);
app.use("/api/ai", aiRouter);
app.use("/api/gamification", gameRouter);

// Error handling middleware
app.use(errorHandler);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", userId);
  });

  socket.on("send-message", ({ roomId, message, user }) => {
    io.to(roomId).emit("receive-message", { message, user, timestamp: new Date() });
  });

  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
