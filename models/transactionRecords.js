const mongoose = require("mongoose");

const TransactionRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    reference_code: {
      type: String,
      required: true,
    },
    transaction_id: {
      type: String,
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

module.exports = mongoose.model("TransactionRecord", TransactionRecordSchema);
