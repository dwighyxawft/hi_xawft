const mongoose = require("mongoose");

const bettingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    }, 
    transaction_id: {
      type: String, 
      required: true
    },
    platform: {
        type: String,
        required: true
      },
    status: {
      type: String,
      required: true
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Betting", bettingSchema);
