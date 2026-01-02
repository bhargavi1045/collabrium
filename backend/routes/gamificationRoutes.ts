import { Router } from "express";
import { addXP, updateStreak, leaderboard } from "../controllers/gamificationController";
const router = Router();

router.post("/xp", addXP);
router.post("/streak", updateStreak);
router.get("/leaderboard", leaderboard);

export default router;
