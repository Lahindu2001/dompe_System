const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addFundsSchema = new Schema({
    reg_no: { 
        type: Number, 
        required: [true, 'Reg. No is required'],
        index: true
    },
    year: { 
        type: Number, 
        required: [true, 'Year is required'],
        min: [2000, 'Year must be 2000 or later']
    },
    month: [{ 
        type: Number,  
        min: [1, 'Month must be between 1-12'],
        max: [12, 'Month must be between 1-12']
    }],  
    cash: { 
        type: Number, 
        required: [true, 'Cash amount is required'],
        min: [500, 'Cash amount must be 500 or greater']
        
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});

// Validate array not empty
addFundsSchema.pre('save', function(next) {
    if (!this.month || this.month.length === 0) {
        return next(new Error('At least one month must be selected'));
    }
    // Ensure no duplicates
    const uniqueMonths = [...new Set(this.month)].sort((a, b) => a - b);
    if (uniqueMonths.length !== this.month.length) {
        return next(new Error('Months must be unique'));
    }
    this.month = uniqueMonths;
    next();
});

module.exports = mongoose.model("AddFunds", addFundsSchema);