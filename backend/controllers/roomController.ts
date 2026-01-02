import { Request, Response } from "express";
import { Types } from "mongoose";
import Room from "../models/Room";


interface AuthRequest extends Request {
  user?: { id: string; username: string };
}

//create a room
export const createRoom = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, isPrivate, description } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!name) return res.status(400).json({ message: "Room name is required" });

    const room = await Room.create({
      name,
      description: description ?? "",
      createdBy: new Types.ObjectId(user.id),
      members: [new Types.ObjectId(user.id)],
      isPrivate: isPrivate ?? false
    });

    res.status(201).json(room);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//get all rooms of the logges in user
export const getMyRooms = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const rooms = await Room.find({ members: new Types.ObjectId(user.id) }).sort({ updatedAt: -1 });
    res.status(200).json(rooms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


//get a particular room by id
export const getRoomById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { roomId } = req.params;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!Types.ObjectId.isValid(roomId)) return res.status(400).json({ message: "Invalid room ID" });

    const room = await Room.findById(roomId)
      .populate("members", "username")
      .populate("createdBy", "username");

    if (!room) return res.status(404).json({ message: "Room not found" });

    const isMember = room.members.some((member: any) => member._id.toString() === user.id);
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    res.status(200).json(room);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


//join room
export const joinRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!Types.ObjectId.isValid(roomId)) return res.status(400).json({ message: "Invalid room ID" });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.members.some((id: Types.ObjectId) => id.toString() === user.id))
      return res.status(400).json({ message: "Already a member" });

    room.members.push(new Types.ObjectId(user.id));
    await room.save();

    res.status(200).json({ message: "Joined room", room });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//leave room
export const leaveRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!Types.ObjectId.isValid(roomId)) return res.status(400).json({ message: "Invalid room ID" });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.members = room.members.filter((id: Types.ObjectId) => id.toString() !== user.id);
    await room.save();

    res.status(200).json({ message: "Left room" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//delete the room (only owner can delete)
export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!Types.ObjectId.isValid(roomId)) return res.status(400).json({ message: "Invalid room ID" });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.createdBy.toString() !== user.id)
      return res.status(403).json({ message: "Only owner can delete room" });

    await room.deleteOne();
    res.status(200).json({ message: "Room deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
