const mongoose = require("mongoose");

const electricitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    }, 
    reference_id: {
      type: String,
      required: true
    },
    biller_id: {
        type: String,
        required: true
    },
    meter: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Electricity", electricitySchema);
