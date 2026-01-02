import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/User";


interface AuthRequest extends Request {
  user?: { id: string; username: string };
}

// Calculate level
const calculateLevel = (xp: number) => Math.floor(xp / 100) + 1;

// Add XP
export const addXP = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { xp } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });


    if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid userId" });
    if (typeof xp !== "number") return res.status(400).json({ message: "XP must be a number" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.xp += xp;
    user.level = calculateLevel(user.xp);
    await user.save();

    res.json({ message: "XP added", xp: user.xp, level: user.level });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Update streak
export const updateStreak = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });


    if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid userId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.streak += 1;
    await user.save();

    res.json({ message: "Streak updated", streak: user.streak });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Leaderboard
export const leaderboard = async (_req: Request, res: Response) => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(10)
      .select("username xp level");
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
