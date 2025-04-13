import mongoose from "mongoose";
import "dotenv/config";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(`${process.env.URI}`);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}; 