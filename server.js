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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//  EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views")); // use project root
app.use(express.static(path.join(process.cwd(), "public"))); // fix static path
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(expressLayouts);
app.set("layout", "layout");

//  Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

//  Connect MongoDB
connectDB();

//  Routes
app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/transactions", tranRoutes);

//  Default route
app.get("/", (req, res) => res.redirect("/login"));

//  Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
