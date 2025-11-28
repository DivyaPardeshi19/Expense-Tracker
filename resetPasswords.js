import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.js";

dotenv.config();

const resetPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB Atlas");

    const usersToReset = [
      { email: "div@example.com", newPassword: "123456" },
      { email: "random@gmail.in", newPassword: "123456" },
    ];

    for (const u of usersToReset) {
      const user = await User.findOne({ email: u.email });
      if (user) {
        user.password = await bcrypt.hash(u.newPassword, 10);
        await user.save();
        console.log(`Password reset for: ${u.email}`);
      } else {
        console.log(`User not found: ${u.email}`);
      }
    }

    console.log("All passwords reset successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
};

resetPasswords();
