import express from "express";
import { auth } from "./middleware/authMidd.js";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";

import authRoutes from "./routes/authRoutes.js";
import tranRoutes from "./routes/tranRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { connectDB } from "./config/db.js";




dotenv.config();
const app = express();

// 🔹 Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// 🔹 EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.json());
app.use(cors());
app.use(expressLayouts);
app.set("layout", "layout");


// 🔹 Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
     store: MongoStore.create({
     mongoUrl: process.env.MONGO_URL, // your mongo URL
     collectionName: "sessions",       // (optional)
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);
 

// 🔹 Connect MongoDB
connectDB();

// 🔹 API Routes (Postman / fetch) 
app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/transactions", tranRoutes);
 

// 🔹 EJS Pages 
 //app.use("/", viewRoutes); 

app.get('/transactions', auth, async (req, res) => {
  const userId = req.user.userId;
  const transactions = await Transaction.find({ userId }).sort({ date: -1 });
  res.render('incomeExp', { title: "Add Transaction", transactions });
});

// 🔹 Default route
app.get("/", (req, res) => res.redirect("/login"));

// 🔹 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
