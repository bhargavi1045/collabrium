import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import { startCall, endCall, getUserSessions } from "../controllers/videoController";

const router = Router();

router.use(authenticateJWT);

router.post("/start", startCall);

router.post("/end", endCall);

router.get("/user/:userId", getUserSessions);

export default router;
