const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const authSchema = new Schema({
    user_id: {
        type: String,
        default: ""
    },
    admin_id: {
        type: String,
        default: ""
    },
    access: {
        type: String,
        required: true
    },
    refresh: {
        type: String,
        required: true
    },
    expires_at: {
        type: Date,
        default: Date.now() + (1000 * 60 * 60 * 24)
    }
}, {timestamps: true});
const Auth = mongoose.model("Auth", authSchema);
module.exports = Auth;