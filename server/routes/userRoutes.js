const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const RegistrationOTP = require("../models/RegistrationOTP");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const { logActivity } = require("../utils/activityLogger");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

router.post("/send-otp", async (req, res) => {
  try {
    const { fullName, email, password, barangay } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Full name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error("Gmail environment variables are not configured.");
      return res.status(500).json({
        message: "Email service is not configured. Please try again later.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = fullName.trim();
    const normalizedBarangay =
      typeof barangay === "string" ? barangay.trim() : "";

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    const existingPending = await RegistrationOTP.findOne({
      email: normalizedEmail,
    });

    if (
      existingPending?.lastSentAt &&
      Date.now() - existingPending.lastSentAt.getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        message: "Please wait 60 seconds before requesting another OTP.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const hashedPassword = await bcrypt.hash(password, 12);

    await RegistrationOTP.findOneAndUpdate(
      { email: normalizedEmail },
      {
        fullName: normalizedName,
        email: normalizedEmail,
        password: hashedPassword,
        barangay: normalizedBarangay,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        lastSentAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    try {
      await transporter.sendMail({
        from: `"SDG Smart Hub" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: "SDG Smart Hub - Email Verification Code",
        text: `Your SDG Smart Hub verification code is ${otp}.

This code expires in 10 minutes. If you did not try to create an account, you can ignore this email.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#172033">
            <h2>SDG Smart Hub Email Verification</h2>
            <p>Use this code to verify your email address and finish creating your account:</p>
            <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:16px 0">${otp}</div>
            <p>This code expires in <strong>10 minutes</strong>.</p>
            <p>If you did not request this code, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("[SEND OTP EMAIL ERROR]", emailError);

      await RegistrationOTP.deleteOne({
        email: normalizedEmail,
        otpHash,
      });

      return res.status(502).json({
        message: "Could not send the verification email. Please try again later.",
      });
    }

    return res.json({
      message: "Verification code sent. Please check your email.",
    });
  } catch (err) {
    console.error("[SEND OTP ERROR]", err);
    return res.status(500).json({
      message: "Failed to send verification code.",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.toLowerCase().trim()
        : "";

    const otp =
      typeof req.body.otp === "string" ? req.body.otp.trim() : "";

    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "Enter your email and the six-digit verification code.",
      });
    }

    const registration = await RegistrationOTP.findOne({ email });

    if (!registration) {
      return res.status(400).json({
        message: "No pending registration was found. Please request a new code.",
      });
    }

    if (registration.expiresAt <= new Date()) {
      await RegistrationOTP.deleteOne({ _id: registration._id });

      return res.status(400).json({
        message: "The verification code has expired. Please request a new one.",
      });
    }

    if (registration.attempts >= 5) {
      await RegistrationOTP.deleteOne({ _id: registration._id });

      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new code.",
      });
    }

    const submittedOtpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (submittedOtpHash !== registration.otpHash) {
      registration.attempts += 1;
      await registration.save();

      return res.status(400).json({
        message: "The verification code is incorrect.",
        attemptsRemaining: Math.max(0, 5 - registration.attempts),
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      await RegistrationOTP.deleteOne({ _id: registration._id });

      return res.status(409).json({
        message: "Email already registered.",
      });
    }

    const newUser = await User.create({
      fullName: registration.fullName,
      email: registration.email,
      password: registration.password,
      barangay: registration.barangay || "",
      role: "community_member",
    });

    await RegistrationOTP.deleteOne({ _id: registration._id });

    const userObj = newUser.toObject();
    delete userObj.password;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;

    return res.status(201).json({
      message: "Email verified and account created successfully. You can now log in.",
      user: userObj,
    });
  } catch (err) {
    console.error("[VERIFY OTP ERROR]", err);
    return res.status(500).json({
      message: "Failed to verify email and create account.",
    });
  }
});

// Prevent account creation without email verification.
router.post("/register", async (req, res) => {
  return res.status(410).json({
    message: "Direct registration is disabled. Request an email verification code first.",
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;

    return res.json({
      message: "Login successful.",
      token,
      user: userObj,
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    return res.status(500).json({
      message: "Login failed.",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.toLowerCase().trim()
        : "";

    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If the email is registered, a reset link will be sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      throw new Error("CLIENT_URL is not configured.");
    }

    const resetLink =
      `${clientUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;

    try {
      await transporter.sendMail({
        from: `"SDG Smart Hub" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "SDG Smart Hub - Password Reset",
        text: `You requested a password reset for your SDG Smart Hub account.

Open the following link within 15 minutes to create a new password:

${resetLink}

If you did not request this, you can ignore this email.`,
      });
    } catch (emailError) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      throw emailError;
    }

    return res.json({
      message: "If the email is registered, a reset link will be sent.",
    });
  } catch (err) {
    console.error("[FORGOT PASSWORD ERROR]", err);
    return res.status(500).json({
      message: "Unable to process the password reset request.",
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    if (!/^[a-f0-9]{64}$/i.test(req.params.token)) {
      return res.status(400).json({
        message: "The reset link is invalid or has expired.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "The reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error("[RESET PASSWORD ERROR]", err);
    return res.status(500).json({
      message: "Unable to reset the password.",
    });
  }
});

router.post("/admin", auth, adminOnly, async (req, res) => {
  try {
    const { fullName, email, password, barangay } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Full name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(400).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      barangay: barangay?.trim() || undefined,
    });

    await logActivity({
      actor: req.user.id,
      action: "created",
      entityType: "user",
      entityId: newUser._id,
      entityTitle: newUser.fullName,
      details: "Created a new admin account.",
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      message: "Admin account created successfully.",
      user: userObj,
    });
  } catch (err) {
    console.error("[CREATE ADMIN ERROR]", err);
    return res.status(500).json({
      message: "Failed to create admin account.",
    });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({ user });
  } catch (err) {
    console.error("[GET ME ERROR]", err);
    return res.status(500).json({
      message: "Failed to get user.",
    });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const { password, ...safeFields } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      safeFields,
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    await logActivity({
      actor: req.user.id,
      action: "updated",
      entityType: "user",
      entityId: user._id,
      entityTitle: user.fullName,
      details: "Updated user account details.",
    });

    return res.json({
      message: "User updated successfully.",
      user,
    });
  } catch (err) {
    console.error("[UPDATE USER ERROR]", err);
    return res.status(500).json({
      message: "Failed to update user.",
    });
  }
});

router.put("/:id/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not allowed to change this user's password.",
      });
    }

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await logActivity({
      actor: req.user.id,
      action: "updated",
      entityType: "user",
      entityId: user._id,
      entityTitle: user.fullName,
      details: "Changed account password.",
    });

    return res.json({
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("[UPDATE PASSWORD ERROR]", err);
    return res.status(500).json({
      message: "Failed to update user password.",
    });
  }
});

router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 });

    return res.json({ users });
  } catch (err) {
    console.error("[GET USERS ERROR]", err);
    return res.status(500).json({
      message: "Failed to get users.",
    });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    await logActivity({
      actor: req.user.id,
      action: "deleted",
      entityType: "user",
      entityId: user._id,
      entityTitle: user.fullName,
      details: "Deleted a user account.",
    });

    return res.json({
      message: "User deleted successfully.",
    });
  } catch (err) {
    console.error("[DELETE USER ERROR]", err);
    return res.status(500).json({
      message: "Failed to delete user.",
    });
  }
});

module.exports = router;