
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Render pages
router.get("/register", (req, res) => res.render("register", { title: "Register", error: null }));
router.get("/login", (req, res) => res.render("login", { title: "Login", error: null }));

// POST register
router.post("/register", registerUser);

//POST login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", { title: "Login", error: "All fields are required" });
    }

     console.log("Attempting login:", { email, password });

    const user = await loginUser(email, password);

     console.log("User returned by loginUser:", user);

    if (!user) {
      return res.render("login", { title: "Login", error: "Invalid credentials" });
    }

    // Save userId in session
    req.session.userId = user._id;

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("login", { title: "Login", error: "Server Error" });
  }
});



// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

export default router;
