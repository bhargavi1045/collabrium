import { Router } from "express";
import { createChallenge, completeChallenge } from "../controllers/challengeController";
const router = Router();

router.post("/", createChallenge);
router.post("/complete", completeChallenge);

export default router;
