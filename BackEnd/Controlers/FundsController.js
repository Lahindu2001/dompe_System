const User = require("../Model/UserModel");
const AddFunds = require("../Model/AddFundsModel");

// Get all funds with joined user data
const getAllFunds = async (req, res, next) => {
    let fundsData;
    try {
        // Fetch all users
        const users = await User.find().sort({ created_at: -1 });
        
        // For each user, fetch their funds and aggregate
        fundsData = await Promise.all(
            users.map(async (user) => {
                const funds = await AddFunds.find({ reg_no: user.reg_no })
                    .sort({ created_at: -1 }) // Sort funds by most recent first
                    .lean(); // Use lean for performance
                return {
                    user: user,
                    funds: funds || []
                };
            })
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error while fetching funds data" });
    }
    if (!fundsData || fundsData.length === 0) {
        return res.status(404).json({ message: "No funds data found" });
    }
    return res.status(200).json({ shops: fundsData });
};

exports.getAllFunds = getAllFunds;