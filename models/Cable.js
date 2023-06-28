const mongoose = require("mongoose");

const cableSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    type: {
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
    iuc: {
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

module.exports = mongoose.model("Cable", cableSchema);
