const express = require("express");
const router = express.Router();
const PaymentController = require("../Controlers/PaymentControllers");

router.post("/", PaymentController.addPayment);

module.exports = router;