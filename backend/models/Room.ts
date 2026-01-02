import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isPrivate: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);
export default Room;
