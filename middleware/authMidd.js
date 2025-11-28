// authMidd.js
import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  // If session has userId → allow
  if (req.session?.userId) {
    req.user = { userId: req.session.userId };
    return next();
  }

  // Else check JWT
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    next();
  } catch (err) {
    console.error(err);
    return res.redirect("/login");
  }
};

