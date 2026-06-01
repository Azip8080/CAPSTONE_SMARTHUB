const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["admin", "barangay_personnel", "community_member"],
        default: "community_member"
    },

    barangay: {
        type: String
    }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);