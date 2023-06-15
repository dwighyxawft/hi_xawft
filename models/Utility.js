const mongoose = require("mongoose");

const electricitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    email: {
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
    status: {
      type: String,
      default: "processing"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Electricity", electricitySchema);
