import express from "express";
import Transaction from "../models/transaction.js";
import { auth } from "../middleware/authMidd.js";

const router = express.Router();

// GET all transactions (for dashboard)
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST Add Transaction
router.post("/add", auth, async (req, res) => {
  try {
    const { type, amount, category, date, note } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).send("Missing fields");
    }

    await Transaction.create({
      userId: req.user.userId,
      type,
      amount: Number(amount),
      category,
      date: new Date(date),
      note: note || ""
    });

    res.redirect("/transactions"); //  redirect back to transaction
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// DELETE a transaction
router.post("/delete/:id", auth, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


export default router;
