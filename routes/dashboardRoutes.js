import express from "express";
import { auth } from "../middleware/authMidd.js";
import Transaction from "../models/transaction.js";
import User from "../models/user.js";

const router = express.Router();

// Dashboard with filter/sort & stats

router.get("/dashboard", auth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await User.findById(userId).lean();

    let transactions = await Transaction.find({ userId }).lean();

    // Filter & Sort
    const { type, sort } = req.query;
    if (type) transactions = transactions.filter(tx => tx.type === type);

    switch (sort) {
      case "oldest":
        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "amountAsc":
        transactions.sort((a, b) => a.amount - b.amount);
        break;
      case "amountDesc":
        transactions.sort((a, b) => b.amount - a.amount);
        break;
      default:
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Calculate stats
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(tx => {
      const t = (tx.type || "").trim().toLowerCase();
      if (t === "income") totalIncome += Number(tx.amount);
      if (t === "expense") totalExpense += Number(tx.amount);
    });

    const stats = { totalIncome, totalExpense, balance: totalIncome - totalExpense };

    // Monthly Summary Data for Chart
    const months = [];
    const incomeData = [];
    const expenseData = [];
    const monthMap = {};

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const month = date.toLocaleString("default", { month: "short", year: "numeric" });

      if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };

      const amount = Number(tx.amount) || 0;
      const t = (tx.type || "").trim().toLowerCase();
      if (t === "income" || t === "expense") monthMap[month][t] += amount;
    });

    Object.keys(monthMap)
      .sort((a, b) => {
        const [monA, yearA] = a.split(" ");
        const [monB, yearB] = b.split(" ");
        return new Date(`${monA} 1, ${yearA}`) - new Date(`${monB} 1, ${yearB}`);
      })
      .forEach(mon => {
        months.push(mon);
        incomeData.push(monthMap[mon].income);
        expenseData.push(monthMap[mon].expense);
      });

    res.render("dashboard", {
      user,
      stats,
      transactions,
      title: "Dashboard",
      months,
      incomeData,
      expenseData,
      filterType: type || "",
      sort: sort || "newest"
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


//  Add Transaction Page

// GET Add Transaction Page
router.get("/transactions", auth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { type } = req.query; // "income" or "expense"

    // Only get transactions of that type if provided
    let query = { userId };
    if (type === "income" || type === "expense") query.type = type;

    const transactions = await Transaction.find(query).lean();

    res.render("incomeExp", { 
        title: type === "expense" ? "Add Expense" : "Add Income", 
        transactions,
        type: type || "income" // pass type to EJS so form can default
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});



// POST Add Transaction

router.post("/dashboard/transactions/add", auth, async (req, res) => {
  try {
    const { type, amount, category, date, note } = req.body;
    if (!type || !amount || !category || !date) return res.status(400).send("Missing fields");

    await Transaction.create({
      userId: req.session.userId,
      type: (type || "").trim().toLowerCase(),
      amount: Number(amount),
      category,
      date: new Date(date),
      note: note || ""
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Edit Page - Show existing data
router.get("/transactions/edit/:id", auth, async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  res.render("editTransaction", { transaction });
});


// Update Transaction (POST method)
router.post("/transactions/update/:id", auth, async (req, res) => {
  try {
    await Transaction.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/dashboard");
  } catch (err) {
    res.send(err);
  }
});



// POST Delete Transaction

router.post("/dashboard/transactions/delete/:id", auth, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// GET Monthly Summary Page

router.get("/monthlysummary", auth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const transactions = await Transaction.find({ userId }).lean();

    const monthMap = {};
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const month = date.toLocaleString("default", { month: "short", year: "numeric" });
      if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };

      const amount = Number(tx.amount) || 0;
      const type = (tx.type || "").trim().toLowerCase();
      if (type === "income" || type === "expense") monthMap[month][type] += amount;
    });

    const months = [];
    const incomeData = [];
    const expenseData = [];
    const monthlySummary = [];

    Object.keys(monthMap)
      .sort((a, b) => {
        const [monA, yearA] = a.split(" ");
        const [monB, yearB] = b.split(" ");
        return new Date(`${monA} 1, ${yearA}`) - new Date(`${monB} 1, ${yearB}`);
      })
      .forEach(mon => {
        months.push(mon);
        incomeData.push(monthMap[mon].income);
        expenseData.push(monthMap[mon].expense);
        monthlySummary.push({
        month: mon,
        income: monthMap[mon].income.toLocaleString(),
        expense: monthMap[mon].expense.toLocaleString(),
        balance: (monthMap[mon].income - monthMap[mon].expense).toLocaleString()
});

      });

    res.render("monthlysummary", { months, incomeData, expenseData, monthlySummary, title: "Monthly Summary" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

export default router;
