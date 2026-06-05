const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    sdgTag: {
        type: String,
        required: true
    },

    barangay: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Planned", "Ongoing", "Completed"],
        default: "Planned"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);