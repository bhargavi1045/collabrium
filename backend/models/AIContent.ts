import mongoose from "mongoose";

const AIContentSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    modelUsed: { type: String, default: "gpt-4" }
  },
  { timestamps: true }
);

const AIContent = mongoose.models.AIContent || mongoose.model("AIContent", AIContentSchema);
export default AIContent;
