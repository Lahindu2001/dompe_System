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
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log("🚀 Server running on port " + port));
  })
  .catch((err) => console.log(err));