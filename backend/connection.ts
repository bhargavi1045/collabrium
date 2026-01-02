import mongoose from "mongoose";

export const connectDB = async (mongoURL?: string) => {
  if (!mongoURL) {
    console.error("MongoDB URI is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};
