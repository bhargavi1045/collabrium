import { Router } from "express";
import {
  createRoom,
  joinRoom,
  leaveRoom,
  getMyRooms,
  getRoomById,
  deleteRoom
} from "../controllers/roomController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.use(authenticateJWT);

router.post("/", createRoom);

router.get("/", getMyRooms);

router.get("/:roomId", getRoomById);

router.post("/join/:roomId", joinRoom);

router.post("/leave/:roomId", leaveRoom);

router.delete("/:roomId", deleteRoom);

export default router;
