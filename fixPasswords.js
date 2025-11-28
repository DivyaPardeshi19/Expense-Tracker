// one-time fixPasswords.js
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.js";
dotenv.config();

await mongoose.connect(process.env.MONGO_URL);

const users = await User.find({});
for (let user of users) {
  if (!user.password.startsWith("$2")) { // not hashed
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
    console.log(`Hashed password for ${user.email}`);
  }
}

console.log("All passwords fixed");
process.exit();
