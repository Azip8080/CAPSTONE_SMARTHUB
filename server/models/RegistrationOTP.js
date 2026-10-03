const mongoose = require("mongoose");

const RegistrationOTPSchema =
  new mongoose.Schema(
    {
      fullName: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      password: {
        type: String,
        required: true,
      },

      barangay: {
        type: String,
        default: "",
      },

      otpHash: {
        type: String,
        required: true,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      attempts: {
        type: Number,
        default: 0,
      },

      lastSentAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "RegistrationOTP",
    RegistrationOTPSchema
  );