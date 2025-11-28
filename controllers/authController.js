// controllers/authController.js
import User from "../models/user.js";
import bcrypt from "bcryptjs";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check all fields
    if (!name || !email || !password) {
      return res.render("register", { title: "Register", error: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { title: "Register", error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Save userId in session
    req.session.userId = user._id;

    // Redirect to dashboard
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("register", { title: "Register", error: "Server Error" });
  }
};

// Login User
export const loginUser = async (email, password) => {
  // Returns user object if valid, otherwise null
  const user = await User.findOne({ email });
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return null;

  return user;
};
