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
        if (cash === undefined || cash < 0) {
            return res.status(400).json({ message: "Cash amount must be 0 or greater" });
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

exports.addPayment = addPayment;