import { Router } from "express";
import { createNote, getNotesByRoom, updateNote, deleteNote } from "../controllers/noteController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.post("/", authenticateJWT, createNote);

router.get("/room/:roomId", authenticateJWT, getNotesByRoom);

router.put("/:id", authenticateJWT, updateNote);

router.delete("/:id", authenticateJWT, deleteNote);

export default router;