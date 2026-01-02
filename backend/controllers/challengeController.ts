import { Request, Response } from "express";
import { Types } from "mongoose";
import Challenge from "../models/Challenge";
import User from "../models/User";


interface AuthRequest extends Request {
  user?: { id: string; username: string };
}

// create a challenge
export const createChallenge = async (req: AuthRequest, res: Response) => {
  try {
    const { title, xpReward } = req.body;
    if (!title || xpReward == null) {
      return res.status(400).json({ message: "Title and xpReward are required" });
    }

    const challenge = await Challenge.create({ title, xpReward });
    res.status(201).json(challenge);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// complete a challenge
export const completeChallenge = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { challengeId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });


    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({ message: "Invalid userId or challengeId" });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    await User.findByIdAndUpdate(userId, { $inc: { xp: challenge.xpReward } });
    res.json({ message: "XP awarded" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
