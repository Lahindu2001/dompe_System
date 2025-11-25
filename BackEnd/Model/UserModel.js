const mongoose = require("mongoose");
const Counter = require("./CounterModel");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    reg_no: { type: Number, unique: true },
    shop_owner_name: { type: String, required: true },
    shop_name: { type: String, required: true },
    phone_number: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
    if (!this.reg_no) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'reg_no' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.reg_no = counter.seq;
    }
    next();
});

module.exports = mongoose.model("RegShopss", userSchema);