const express = require("express");
const router = express.Router();
const PaymentController = require("../Controlers/PaymentControllers");

router.post("/", PaymentController.addPayment);
router.get("/reg/:reg_no", PaymentController.getPaymentsByRegNo);
router.put("/:id", PaymentController.updatePayment);
router.delete("/:id", PaymentController.deletePayment);

module.exports = router;