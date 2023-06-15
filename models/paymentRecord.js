const mongoose = require("mongoose");

const PaymentRecord = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PaymentRecord", PaymentRecord);
