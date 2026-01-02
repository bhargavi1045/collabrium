import { Request, Response } from "express";
import { Types } from "mongoose";
import VideoSession from "../models/VideoSession";


export const startCall = async (req: Request, res: Response) => {
  try {
    const { callerId, calleeId, roomId } = req.body;

    if (!Types.ObjectId.isValid(callerId) || !Types.ObjectId.isValid(calleeId))
      return res.status(400).json({ message: "Invalid user IDs" });

    const session = await VideoSession.create({
      caller: new Types.ObjectId(callerId),
      callee: new Types.ObjectId(calleeId),
      roomId: roomId ? new Types.ObjectId(roomId) : undefined,
      status: "ongoing",
    });

    res.status(201).json({ message: "Call started", session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export const endCall = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    if (!Types.ObjectId.isValid(sessionId)) return res.status(400).json({ message: "Invalid session ID" });

    const session = await VideoSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.status = "ended";
    session.endedAt = new Date();
    await session.save();

    res.status(200).json({ message: "Call ended", session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID" });

    const sessions = await VideoSession.find({
      $or: [{ caller: userId }, { callee: userId }],
    }).sort({ startedAt: -1 });

    res.status(200).json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
