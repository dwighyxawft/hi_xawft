const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    bank_code: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true,
    }, 
    transaction_id: {
      type: String, 
      required: true
    },
    account_number: {
        type: String, 
        required: true
    },
    status: {
      type: String,
      required: true
    },
    narration: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Withdrawal", withdrawSchema);
