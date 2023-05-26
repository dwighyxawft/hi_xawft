const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true

    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    referrer: String,
    pin: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 00
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});
const User = mongoose.model("User", userSchema);
module.exports = User;