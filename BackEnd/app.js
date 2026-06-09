const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./Routes/UserRoutes");
const paymentRouter = require("./Routes/PaymentRoutes");
const fundsRouter = require("./Routes/FundsRoutes"); // New import
const path = require("path");
const fs = require("fs");
const cors = require("cors");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// ------------------- MIDDLEWARE -------------------
app.use(express.json());
app.use(cors());

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static files from uploads folder
app.use("/uploads", express.static(uploadDir));

// ------------------- ROUTES -------------------
app.use("/users", userRouter);
app.use("/payments", paymentRouter);
app.use("/funds", fundsRouter); // New route

// ------------------- DATABASE -------------------
app.listen(port, "0.0.0.0", () => {
  console.log("🚀 Server running on port " + port);
});

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("❌ MONGODB_URI is missing. Add it in Railway environment variables.");
} else {
  mongoose
    .connect(mongoUri)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.log("❌ MongoDB connection error:", err));
}