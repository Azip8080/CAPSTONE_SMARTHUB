const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const auth = require("../middleware/auth");
const adminOnly =
  require("../middleware/adminOnly");

const {
  logActivity,
} = require("../utils/activityLogger");

router.post(
  "/register",
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

      const hashedPassword =
        await bcrypt.hash(
          password,
          12
        );

      const newUser =
        await User.create({
          fullName: fullName.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          barangay:
            barangay?.trim() || "",
          role: "community_member",
        });

      const userObj =
        newUser.toObject();

      delete userObj.password;

      return res.status(201).json({
        message:
          "Account created successfully.",
        user: userObj,
      });
    } catch (err) {
      console.error(
        "[REGISTER ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Failed to create account.",
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
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      const token =
        jwt.sign(
          {
            id: user._id,
            role: user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

      const userObj =
        user.toObject();

      delete userObj.password;

      return res.json({
        message: "Login successful.",
        token,
        user: userObj,
      });
    } catch (err) {
      console.error(
        "[LOGIN ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Login failed.",
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
          fullName: fullName.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "admin",
          barangay:
            barangay?.trim() ||
            undefined,
        });

      await logActivity({
        actor: req.user.id,
        action: "created",
        entityType: "user",
        entityId: newUser._id,
        entityTitle: newUser.fullName,
        details:
          "Created a new admin account.",
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
            "User not found.",
        });
      }

      return res.json({
        user,
      });
    } catch (err) {
      console.error(
        "[GET ME ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Failed to get user.",
      });
    }
  }
);

router.put(
  "/:id",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const {
        password,
        ...safeFields
      } = req.body;

      const user =
        await User.findByIdAndUpdate(
          req.params.id,
          safeFields,
          {
            new: true,
            runValidators: true,
          }
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      await logActivity({
        actor: req.user.id,
        action: "updated",
        entityType: "user",
        entityId: user._id,
        entityTitle: user.fullName,
        details:
          "Updated user account details.",
      });

      return res.json({
        message:
          "User updated successfully.",
        user,
      });
    } catch (err) {
      console.error(
        "[UPDATE USER ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Failed to update user.",
      });
    }
  }
);

router.put(
  "/:id/password",
  auth,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Current password and new password are required.",
        });
      }

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
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
            "Current password is incorrect.",
        });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          12
        );

      await user.save();

      await logActivity({
        actor: req.user.id,
        action: "updated",
        entityType: "user",
        entityId: user._id,
        entityTitle: user.fullName,
        details:
          "Changed account password.",
      });

      return res.json({
        message:
          "Password updated successfully.",
      });
    } catch (err) {
      console.error(
        "[UPDATE PASSWORD ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Failed to update password.",
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

      return res.json({
        users,
      });
    } catch (err) {
      console.error(
        "[GET USERS ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Failed to get users.",
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
            "User not found.",
        });
      }

      await logActivity({
        actor: req.user.id,
        action: "deleted",
        entityType: "user",
        entityId: user._id,
        entityTitle: user.fullName,
        details:
          "Deleted a user account.",
      });

      return res.json({
        message:
          "User deleted successfully.",
      });
    } catch (err) {
      console.error(
        "[DELETE USER ERROR]",
        err
      );

      return res.status(500).json({
        message:
          "Failed to delete user.",
      });
    }
  }
);

module.exports = router;