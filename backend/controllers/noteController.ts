import { Request, Response } from "express";
import { Types } from "mongoose";
import Note from "../models/Note";


interface AuthRequest extends Request {
  user?: { id: string; username: string };
}

//create note
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, content } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!roomId || !content) return res.status(400).json({ message: "roomId and content required" });

    const note = await Note.create({
      roomId: new Types.ObjectId(roomId),
      content,
      createdBy: new Types.ObjectId(user.id)
    });

    res.status(201).json({
      id: note._id,
      roomId: note.roomId,
      content: note.content,
      createdAt: note.createdAt
});

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//get notes by room
export const getNotesByRoom = async (req: Request<{ roomId: string }>, res: Response) => {
  try {
    const { roomId } = req.params;
    if (!Types.ObjectId.isValid(roomId)) return res.status(400).json({ message: "Invalid room ID" });

    const notes = await Note.find({ roomId: new Types.ObjectId(roomId) }).sort({ createdAt: 1 });
    res.status(200).json(notes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//update a note
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid note ID" });

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.createdBy.toString() !== user.id)
      return res.status(403).json({ message: "Not authorized" });

    note.content = content;
    await note.save();

    res.status(200).json(note);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

//delete a note
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid note ID" });

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.createdBy.toString() !== user.id)
      return res.status(403).json({ message: "Not authorized" });

    await note.deleteOne();
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
