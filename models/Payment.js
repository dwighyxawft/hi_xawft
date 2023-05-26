const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paymentSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 50,
        max: 5000
    },
    reference: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
}, {timestamps: true});
const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;