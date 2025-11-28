// viewRoutes.js
import express from "express";
import { auth } from "../middleware/authMidd.js";
import Transaction from "../models/transaction.js";

const router = express.Router();

router.get("/dashboard", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
      if (tx.type === "income") totalIncome += tx.amount;
      if (tx.type === "expense") totalExpense += tx.amount;
    });

    const stats = { totalIncome, totalExpense, balance: totalIncome - totalExpense };

    res.render("dashboard", {
      title: "Dashboard",
      user: req.user,        
      stats,                 // PASSED CORRECTLY
      transactions
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Render Register Page
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

export default router;
