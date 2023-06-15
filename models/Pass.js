const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const forgotSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    u_uid: {
        type: String,
        required: true
    },
    expires_at: {
        type: Date,
        default: Date.now() + (1000 * 60 * 10)
    }
});
const Forgot = mongoose.model("Forgot", forgotSchema);
module.exports = Forgot;