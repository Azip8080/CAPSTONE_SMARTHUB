const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const emailjs = require("@emailjs/nodejs");

const User = require("../models/User");
const RegistrationOTP = require("../models/RegistrationOTP");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const { logActivity } = require("../utils/activityLogger");

async function sendEmailJSTemplate(templateId, templateParams) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !publicKey || !privateKey || !templateId) {
    throw new Error("EmailJS environment variables are not configured.");
  }

  return emailjs.send(serviceId, templateId, templateParams, {
    publicKey,
    privateKey,
  });
}

function removeSensitiveFields(user) {
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;

  return userObj;
}

// REQUEST EMAIL OTP
router.post("/send-otp", async (req, res) => {
  let normalizedEmail;
  let otpHash;

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

    if (
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_PUBLIC_KEY ||
      !process.env.EMAILJS_PRIVATE_KEY ||
      !process.env.EMAILJS_OTP_TEMPLATE_ID
    ) {
      return res.status(500).json({
        message: "Email service is not configured. Please try again later.",
      });
    }

    normalizedEmail = email.toLowerCase().trim();

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
    otpHash = crypto.createHash("sha256").update(otp).digest("hex");

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
      await sendEmailJSTemplate(process.env.EMAILJS_OTP_TEMPLATE_ID, {
        to_email: normalizedEmail,
        otp_code: otp,
        expiry_minutes: 10,
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

    if (normalizedEmail && otpHash) {
      try {
        await RegistrationOTP.deleteOne({
          email: normalizedEmail,
          otpHash,
        });
      } catch (cleanupError) {
        console.error("[OTP CLEANUP ERROR]", cleanupError);
      }
    }

    return res.status(500).json({
      message: "Failed to send verification code.",
    });
  }
});

// VERIFY EMAIL OTP AND CREATE PENDING COMMUNITY ACCOUNT
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
      accountStatus: "Pending",
      verification: {
        verifiedBy: null,
        verifiedAt: null,
        rejectionReason: null,
      },
    });

    await RegistrationOTP.deleteOne({ _id: registration._id });

    return res.status(201).json({
      message:
        "Email verified. Your account is pending administrator approval. You can log in after your account is approved.",
      user: removeSensitiveFields(newUser),
    });
  } catch (err) {
    console.error("[VERIFY OTP ERROR]", err);

    return res.status(500).json({
      message: "Failed to verify email and create account.",
    });
  }
});

// DISABLE DIRECT REGISTRATION
router.post("/register", async (req, res) => {
  return res.status(410).json({
    message:
      "Direct registration is disabled. Request an email verification code first.",
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
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

    // Apply approval checks only to community members.
    // Existing admin and barangay personnel accounts remain separate.
    if (
      user.role === "community_member" &&
      user.accountStatus !== "Active"
    ) {
      if (user.accountStatus === "Rejected") {
        return res.status(403).json({
          message:
            "Your account has been rejected. Please contact the administrator.",
          accountStatus: "Rejected",
        });
      }

      return res.status(403).json({
        message:
          "Your account is awaiting administrator approval. Please try again after it has been approved.",
        accountStatus: "Pending",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[LOGIN ERROR] JWT_SECRET is not configured.");

      return res.status(500).json({
        message: "Server authentication is not configured.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: removeSensitiveFields(user),
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err);

    return res.status(500).json({
      message: "Login failed.",
    });
  }
});

// FORGOT PASSWORD
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

    if (
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_PUBLIC_KEY ||
      !process.env.EMAILJS_PRIVATE_KEY ||
      !process.env.EMAILJS_RESET_TEMPLATE_ID ||
      !process.env.CLIENT_URL
    ) {
      console.error(
        "EmailJS password-reset environment variables are not configured."
      );

      return res.status(500).json({
        message: "Email service is not configured. Please try again later.",
      });
    }

    const user = await User.findOne({ email });

    // Avoid revealing whether an email address has an account.
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

    const clientUrl = process.env.CLIENT_URL.replace(/\/+$/, "");
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    try {
      await sendEmailJSTemplate(process.env.EMAILJS_RESET_TEMPLATE_ID, {
        to_email: user.email,
        reset_link: resetLink,
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

// RESET PASSWORD
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

// CREATE ADMIN
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
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      accountStatus: "Active",
      barangay: typeof barangay === "string" ? barangay.trim() : "",
    });

    await logActivity({
      actor: req.user.id,
      action: "created",
      entityType: "user",
      entityId: newUser._id,
      entityTitle: newUser.fullName,
      details: "Created a new admin account.",
    });

    return res.status(201).json({
      message: "Admin account created successfully.",
      user: removeSensitiveFields(newUser),
    });
  } catch (err) {
    console.error("[CREATE ADMIN ERROR]", err);

    return res.status(500).json({
      message: "Failed to create admin account.",
    });
  }
});

// GET CURRENT USER
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

// LIST USERS FOR ADMIN
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

// APPROVE COMMUNITY ACCOUNT
router.patch("/:id/approve", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role !== "community_member") {
      return res.status(400).json({
        message: "Only community member accounts require this approval.",
      });
    }

    if (user.accountStatus === "Active") {
      return res.status(400).json({
        message: "This account is already active.",
      });
    }

    user.accountStatus = "Active";
    user.verification = {
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
      rejectionReason: null,
    };

    await user.save();

    await logActivity({
      actor: req.user.id,
      action: "approved",
      entityType: "user",
      entityId: user._id,
      entityTitle: user.fullName,
      details: "Approved a community member account.",
    });

    return res.json({
      message: "Community account approved successfully.",
      user: removeSensitiveFields(user),
    });
  } catch (err) {
    console.error("[APPROVE USER ERROR]", err);

    return res.status(500).json({
      message: "Failed to approve account.",
    });
  }
});

// REJECT COMMUNITY ACCOUNT
router.patch("/:id/reject", auth, adminOnly, async (req, res) => {
  try {
    const reason =
      typeof req.body.reason === "string" ? req.body.reason.trim() : "";

    if (!reason) {
      return res.status(400).json({
        message: "Please provide a reason for rejecting this account.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.role !== "community_member") {
      return res.status(400).json({
        message: "Only community member accounts can be rejected here.",
      });
    }

    user.accountStatus = "Rejected";
    user.verification = {
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
      rejectionReason: reason,
    };

    await user.save();

    await logActivity({
      actor: req.user.id,
      action: "rejected",
      entityType: "user",
      entityId: user._id,
      entityTitle: user.fullName,
      details: `Rejected a community member account. Reason: ${reason}`,
    });

    return res.json({
      message: "Community account rejected.",
      user: removeSensitiveFields(user),
    });
  } catch (err) {
    console.error("[REJECT USER ERROR]", err);

    return res.status(500).json({
      message: "Failed to reject account.",
    });
  }
});

// UPDATE USER DETAILS
router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    // Prevent this general-purpose endpoint from changing sensitive fields.
    const {
      password,
      role,
      accountStatus,
      verification,
      resetPasswordToken,
      resetPasswordExpires,
      ...safeFields
    } = req.body;

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

// CHANGE PASSWORD
router.put("/:id/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      req.user.id !== req.params.id &&
      req.user.role !== "admin"
    ) {
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
        message: "New password must be at least 8 characters long.",
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

// DELETE USER
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
      details: "Deleted user account.",
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