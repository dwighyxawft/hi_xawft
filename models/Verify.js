const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const verifyUserSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true

    },
    link: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        default: Date.now() + (1000 * 60 * 60 * 24)
    }
}, {timestamps: true});
const Verification = mongoose.model("Verification", verifyUserSchema);
module.exports = Verification;