const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    sdgTag: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);