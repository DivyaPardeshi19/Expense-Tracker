// config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    // No options required in Mongoose v7+
    await mongoose.connect(mongoUrl);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

