const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true
    },
    network: {
      type: String,
      required: true
    },
    plan: {
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
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Data", dataSchema);
