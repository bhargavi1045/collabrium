import { Router } from "express";
import { generateAIContent } from "../controllers/aiController";
import { authenticateJWT } from "../middleware/auth";

const router = Router();

router.post("/generate", authenticateJWT, generateAIContent);

export default router;
