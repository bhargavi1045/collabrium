import { Schema, model, Types } from "mongoose";

interface IVideoSession {
  roomId?: Types.ObjectId;      
  caller: Types.ObjectId;       
  callee: Types.ObjectId;       
  startedAt: Date;
  endedAt?: Date;
  status: "ongoing" | "ended";
}

const videoSessionSchema = new Schema<IVideoSession>(
  {
    roomId: { type: Types.ObjectId, ref: "Room" },
    caller: { type: Types.ObjectId, ref: "User", required: true },
    callee: { type: Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    status: { type: String, enum: ["ongoing", "ended"], default: "ongoing" },
  },
  { timestamps: true }
);

export default model<IVideoSession>("VideoSession", videoSessionSchema);
