import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    xpReward: { type: Number, required: true }
  },
  { timestamps: true }
);

const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);
export default Challenge;
