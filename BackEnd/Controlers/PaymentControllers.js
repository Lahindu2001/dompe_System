const AddFunds = require("../Model/AddFundsModel");
const User = require("../Model/UserModel");

// Add payment/funds
const addPayment = async (req, res, next) => {
    const { reg_no, year, month, cash } = req.body;
    let payment;
    try {
        // Validate inputs
        if (!reg_no || isNaN(reg_no) || reg_no <= 0) {
            return res.status(400).json({ message: "Valid Reg. No is required" });
        }
        if (!Array.isArray(month) || month.length === 0) {
            return res.status(400).json({ message: "At least one month must be selected" });
        }
        if (!year || year < 2000) {
            return res.status(400).json({ message: "Year must be 2000 or later" });
        }
        if (cash === undefined || cash < 500) {
            return res.status(400).json({ message: "Cash amount must be 500 or greater" });
        }

        // Verify user exists
        const user = await User.findOne({ reg_no: parseInt(reg_no) });
        if (!user) {
            return res.status(404).json({ message: "Shop not found" });
        }

        payment = new AddFunds({ reg_no: parseInt(reg_no), year, month, cash });
        await payment.save();
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (err.message.includes('month')) {
            return res.status(400).json({ message: 'At least one month must be selected' });
        }
        if (err.message.includes('unique')) {
            return res.status(400).json({ message: 'Duplicate entry for this reg_no, year, and months' });
        }
        return res.status(500).json({ message: "Server error while adding payment" });
    }
    if (!payment) return res.status(404).json({ message: "Unable to add payment" });
    return res.status(200).json({ payment });
};

// Update payment
const updatePayment = async (req, res, next) => {
    const { year, month, cash } = req.body;
    const id = req.params.id;
    let payment;
    try {
        // Validate inputs
        if (!Array.isArray(month) || month.length === 0) {
            return res.status(400).json({ message: "At least one month must be selected" });
        }
        if (!year || year < 2000) {
            return res.status(400).json({ message: "Year must be 2000 or later" });
        }
        if (cash === undefined || cash < 500) {
            return res.status(400).json({ message: "Cash amount must be 500 or greater" });
        }

        // Find and update payment
        payment = await AddFunds.findByIdAndUpdate(
            id,
            { year, month, cash },
            { new: true, runValidators: true }
        );

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Verify user exists (optional, for consistency)
        const user = await User.findOne({ reg_no: payment.reg_no });
        if (!user) {
            return res.status(404).json({ message: "Associated shop not found" });
        }
    } catch (err) {
        console.log(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (err.message.includes('month')) {
            return res.status(400).json({ message: 'At least one month must be selected' });
        }
        if (err.message.includes('unique')) {
            return res.status(400).json({ message: 'Duplicate entry for this reg_no, year, and months' });
        }
        return res.status(500).json({ message: "Server error while updating payment" });
    }
    return res.status(200).json({ payment });
};

// Delete payment
const deletePayment = async (req, res, next) => {
    const id = req.params.id;
    let payment;
    try {
        payment = await AddFunds.findByIdAndDelete(id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while deleting payment" });
    }
    return res.status(200).json({ message: "Payment deleted successfully", payment });
};

const getPaymentsByRegNo = async (req, res, next) => {
    const reg_no = parseInt(req.params.reg_no);
    let payments;
    try {
        // Validate reg_no
        if (isNaN(reg_no) || reg_no <= 0) {
            return res.status(400).json({ message: "Valid Reg. No is required" });
        }
        // Verify user exists
        const user = await User.findOne({ reg_no });
        if (!user) {
            return res.status(404).json({ message: "Shop not found" });
        }
        // Fetch payments for this reg_no, sorted by created_at descending
        payments = await AddFunds.find({ reg_no }).sort({ created_at: -1 });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching payments" });
    }
    if (!payments || payments.length === 0) {
        return res.status(200).json({ payments: [] }); // Return empty array, not 404
    }
    return res.status(200).json({ payments });
};

exports.addPayment = addPayment;
exports.updatePayment = updatePayment;
exports.deletePayment = deletePayment;
exports.getPaymentsByRegNo = getPaymentsByRegNo;