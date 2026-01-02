import { Request, Response } from "express";
import { Types } from "mongoose";
import AIContent from "../models/AIContent";
import { generateAIResponse } from "../services/aiOrchestrator";

// Extend Request to include authenticated user
interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

//generate AI content
export const generateAIContent = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, roomId } = req.body;
    const user = req.user;

    // Auth check
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validation
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ message: "Prompt is required" });
    }

    if (!roomId || !Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid roomId" });
    }

    
    const aiResponse = await generateAIResponse(prompt);

    const content = await AIContent.create({
      roomId: new Types.ObjectId(roomId),
      prompt,
      response: aiResponse,
      generatedBy: new Types.ObjectId(user.id),
      modelUsed: process.env.GEMINI_API_KEY
        ? "gemini"
        : process.env.OPENAI_API_KEY
        ? "openai"
        : "deepseek",
    });

    return res.status(201).json({
      id: content._id,
      roomId: content.roomId,
      prompt: content.prompt,
      response: content.response,
      modelUsed: content.modelUsed,
      createdAt: content.createdAt,
    });
  } catch (error: any) {
    console.error("[AI Controller Error]", error.message);
    return res.status(500).json({
      message: "Failed to generate AI response",
    });
  }
};
