const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    sender_email: {
      type: String,
      required: true,
    },
    receiver_email: {
      type: String,
      required: true,
    },
    transaction_id: {
      type: String,
      required: true
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

module.exports = mongoose.model("Transfer", transferSchema);
