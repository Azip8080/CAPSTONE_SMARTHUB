const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const User = require("../models/User");
const RegistrationOTP =
  require("../models/RegistrationOTP");

const auth = require("../middleware/auth");
const adminOnly =
  require("../middleware/adminOnly");

const resend = new Resend(
  process.env.RESEND_API_KEY
);

router.post(
  "/send-otp",
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        barangay,
      } = req.body;

      if (
        !fullName ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Full name, email, and password are required.",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const existing =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existing) {
        return res.status(400).json({
          message:
            "Email already registered.",
        });
      }

      const existingOTP =
        await RegistrationOTP.findOne({
          email: normalizedEmail,
        });

      if (existingOTP) {
        const elapsed =
          Date.now() -
          existingOTP.lastSentAt.getTime();

        if (elapsed < 60000) {
          const remaining = Math.ceil(
            (60000 - elapsed) / 1000
          );

          return res.status(429).json({
            message:
              `Please wait ${remaining} seconds before requesting another OTP.`,
          });
        }
      }

      const otp = crypto
        .randomInt(100000, 1000000)
        .toString();

      const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      const expiresAt = new Date(
        Date.now() + 10 * 60 * 1000
      );

      await RegistrationOTP.findOneAndUpdate(
        {
          email: normalizedEmail,
        },
        {
          fullName:
            fullName.trim(),

          email: normalizedEmail,

          password: passwordHash,

          barangay:
            barangay?.trim() || "",

          otpHash,

          expiresAt,

          attempts: 0,

          lastSentAt: new Date(),
        },
        {
          upsert: true,
          new: true,
        }
      );

      if (!process.env.RESEND_API_KEY) {
        console.error(
          "[OTP] RESEND_API_KEY is missing."
        );

        return res.status(500).json({
          message:
            "Email service is not configured.",
        });
      }

      const { data, error } =
        await resend.emails.send({
          from:
            "SDG Smart Hub <onboarding@resend.dev>",

          to: [normalizedEmail],

          subject:
            "Your SDG Smart Hub verification code",

          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
              <h2 style="color: #2563eb;">
                SDG Smart Hub
              </h2>

              <p>
                Hello ${fullName.trim()},
              </p>

              <p>
                Use the verification code below
                to complete your account registration.
              </p>

              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
                ${otp}
              </div>

              <p>
                This code expires in 10 minutes.
              </p>

              <p>
                Do not share this code with anyone.
              </p>

              <p>
                If you did not request this code,
                you can ignore this email.
              </p>
            </div>
          `,
        });

      if (error) {
        console.error(
          "[OTP EMAIL ERROR]",
          error
        );

        await RegistrationOTP.deleteOne({
          email: normalizedEmail,
        });

        return res.status(502).json({
          message:
            "Failed to send verification email.",
        });
      }

      console.log(
        "[OTP] Email sent:",
        data?.id
      );

      return res.status(200).json({
        message:
          "Verification code sent to your email.",
      });
    } catch (err) {
      console.error(
        "[SEND OTP ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Failed to send verification code.",
      });
    }
  }
);

router.post(
  "/verify-otp",
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          message:
            "Email and OTP are required.",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const registration =
        await RegistrationOTP.findOne({
          email: normalizedEmail,
        });

      if (!registration) {
        return res.status(400).json({
          message:
            "OTP expired or registration not found.",
        });
      }

      if (
        registration.expiresAt <
        new Date()
      ) {
        await RegistrationOTP.deleteOne({
          _id: registration._id,
        });

        return res.status(400).json({
          message:
            "OTP has expired. Please request a new one.",
        });
      }

      if (
        registration.attempts >= 5
      ) {
        await RegistrationOTP.deleteOne({
          _id: registration._id,
        });

        return res.status(429).json({
          message:
            "Too many incorrect attempts. Please request a new OTP.",
        });
      }

      const otpHash = crypto
        .createHash("sha256")
        .update(String(otp))
        .digest("hex");

      if (
        otpHash !==
        registration.otpHash
      ) {
        registration.attempts += 1;

        await registration.save();

        return res.status(400).json({
          message:
            "Incorrect OTP.",
        });
      }

      const existing =
        await User.findOne({
          email: registration.email,
        });

      if (existing) {
        await RegistrationOTP.deleteOne({
          _id: registration._id,
        });

        return res.status(400).json({
          message:
            "Email is already registered.",
        });
      }

      const newUser =
        await User.create({
          fullName:
            registration.fullName,

          email:
            registration.email,

          password:
            registration.password,

          barangay:
            registration.barangay,

          role:
            "community_member",
        });

      await RegistrationOTP.deleteOne({
        _id: registration._id,
      });

      const userObj =
        newUser.toObject();

      delete userObj.password;

      return res.status(201).json({
        message:
          "Account verified and created successfully.",

        user: userObj,
      });
    } catch (err) {
      console.error(
        "[VERIFY OTP ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Failed to verify OTP.",
      });
    }
  }
);

router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      console.log(
        "[LOGIN] Request received"
      );

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Email and password are required.",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      if (!user.password) {
        console.error(
          "[LOGIN] User has no password hash."
        );

        return res.status(500).json({
          message:
            "Account password data is missing.",
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          message:
            "Invalid credentials.",
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error(
          "[LOGIN] JWT_SECRET is missing."
        );

        return res.status(500).json({
          message:
            "Server authentication is not configured.",
        });
      }

      const token = jwt.sign(
        {
          id: user._id.toString(),
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        }
      );

      const userObj =
        user.toObject();

      delete userObj.password;

      console.log(
        "[LOGIN] Successful login for role:",
        user.role
      );

      return res.status(200).json({
        message:
          "Login successful",

        token,

        user: userObj,
      });
    } catch (err) {
      console.error(
        "[LOGIN ERROR]",
        err.stack || err
      );

      return res.status(500).json({
        message:
          "Login failed due to a server error.",

        error: err.message,
      });
    }
  }
);

router.post(
  "/admin",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        password,
        barangay,
      } = req.body;

      if (
        !fullName ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Full name, email, and password are required.",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const existing =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existing) {
        return res.status(400).json({
          message:
            "An account with this email already exists.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );

      const newUser =
        await User.create({
          fullName:
            fullName.trim(),

          email:
            normalizedEmail,

          password:
            hashedPassword,

          role: "admin",

          barangay:
            barangay?.trim() ||
            undefined,
        });

      const userObj =
        newUser.toObject();

      delete userObj.password;

      return res.status(201).json({
        message:
          "Admin account created successfully.",

        user: userObj,
      });
    } catch (err) {
      console.error(
        "[CREATE ADMIN ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Failed to create admin account.",
      });
    }
  }
);

router.get(
  "/me",
  auth,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

router.put(
  "/:id",
  auth,
  async (req, res) => {
    try {
      if (
        req.user.id !==
          req.params.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message:
            "Access denied",
        });
      }

      const {
        password,
        role,
        ...safeFields
      } = req.body;

      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          safeFields,
          { new: true }
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

router.put(
  "/:id/password",
  auth,
  async (req, res) => {
    try {
      if (
        req.user.id !==
        req.params.id
      ) {
        return res.status(403).json({
          message:
            "Access denied",
        });
      }

      const {
        currentPassword,
        newPassword,
      } = req.body;

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const isMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          message:
            "Current password is incorrect",
        });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );

      await user.save();

      res.json({
        success: true,
        message:
          "Password updated successfully",
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

router.get(
  "/",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const users =
        await User.find()
          .select("-password")
          .sort({
            createdAt: -1,
          });

      res.json({
        success: true,
        data: users,
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

router.delete(
  "/:id",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const user =
        await User.findByIdAndDelete(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      res.json({
        success: true,
        message:
          "User deleted",
      });
    } catch (err) {
      res.status(500).json({
        error: err.message,
      });
    }
  }
);

module.exports = router;