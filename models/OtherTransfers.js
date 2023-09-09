const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    bank_code: {
      type: String,
      required: true,
    },
    acct_number: {
      type: String,
      required: true,
    },
    acct_name: {
        type: String,
        required: true,
      },
    reference: {
      type: String,
      required: true
    },
    narration: {
        type: String,
        required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BankTransfers", transferSchema);
