const express = require("express");
const mongoose = require("mongoose");

const userRouter = require("./Routes/UserRoutes");
const paymentRouter = require("./Routes/PaymentRoutes");



const path = require("path");
const fs = require("fs");
const cors = require("cors");

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

// ------------------- DATABASE -------------------
mongoose
  .connect("mongodb+srv://adminSelfme:P40YIFy04Am8rnDe@cluster0.4bp3tta.mongodb.net/sho")
  .then(() => console.log("✅ Connected to MongoDB"))
  .then(() => {
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => console.log(err));


