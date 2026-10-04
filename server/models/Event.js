const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    sdgTag: {
      type: String,
      required: true,
      enum: [
        "SDG 1",
        "SDG 2",
        "SDG 3",
        "SDG 4",
        "SDG 5",
        "SDG 6",
        "SDG 7",
        "SDG 8",
        "SDG 9",
        "SDG 10",
        "SDG 11",
        "SDG 12",
        "SDG 13",
        "SDG 14",
        "SDG 15",
        "SDG 16",
        "SDG 17",
      ],
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "Event",
    EventSchema
  );