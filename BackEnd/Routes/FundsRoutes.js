const express = require("express");
const router = express.Router();

// Import controller
const FundsController = require("../Controlers/FundsController");

// Get all funds with joined user data
router.get("/", FundsController.getAllFunds);

module.exports = router;