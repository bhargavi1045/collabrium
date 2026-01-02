import { Router } from "express";
import { authenticateJWT } from "../middleware/auth";
import { registerUser, loginUser, getUser, addFriend, removeFriend, getFriends } from "../controllers/userController";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/:id", authenticateJWT, getUser);

router.post("/friend/add", authenticateJWT, addFriend);
router.post("/friend/remove", authenticateJWT, removeFriend);
router.get("/:userId/friends", authenticateJWT, getFriends);

export default router;
