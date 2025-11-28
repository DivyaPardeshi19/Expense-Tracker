import Transaction from "../models/transaction.js";
import mongoose from "mongoose"; // <-- add this

// ------------------- ADD TRANSACTION -------------------
export const addTransaction = async (req, res) => {
  try {
    const { type, amount, category, date, note } = req.body;

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const transaction = await Transaction.create({
      userId: new mongoose.Types.ObjectId(req.user.userId), // <-- convert string to ObjectId
      type,
      amount,
      category,
      date: new Date(date),
      note: note || ""
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- GET ALL TRANSACTIONS -------------------
export const getTransactions = async (req, res) => {
  try {
    const { type, category } = req.query;

    const filter = { userId: new mongoose.Types.ObjectId(req.user.userId) }; // <-- convert string to ObjectId

    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter).sort({ date: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data", error: err.message });
  }
};

// ------------------- GET STATS (INCOME vs EXPENSE) -------------------
export const getStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.userId) } }, // <-- convert string to ObjectId
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    let income = 0;
    let expense = 0;
    stats.forEach((s) => {
      if (s._id === "income") income = s.totalAmount;
      if (s._id === "expense") expense = s.totalAmount;
    });

    res.status(200).json({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
};
