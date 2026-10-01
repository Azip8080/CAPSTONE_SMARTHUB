const express   = require("express");
const router    = express.Router();
const bcrypt    = require("bcryptjs");
const jwt       = require("jsonwebtoken");
const User      = require("../models/User");
const auth      = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.post("/register", async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create({ ...req.body, password: hashedPassword, role: "community_member" });
    const userObj = newUser.toObject();
    delete userObj.password;
    res.status(201).json({ message: "User registered successfully", user: userObj });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("[LOGIN] Request received");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!user.password) {
      console.error("[LOGIN] User has no password hash.");
      return res.status(500).json({
        message: "Account password data is missing.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("[LOGIN] JWT_SECRET is missing.");
      return res.status(500).json({
        message: "Server authentication is not configured.",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const userObj = user.toObject();
    delete userObj.password;

    console.log("[LOGIN] Successful login for role:", user.role);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userObj,
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err.stack || err);

    return res.status(500).json({
      message: "Login failed due to a server error.",
      error: err.message,
    });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { password, role, ...safeFields } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, safeFields, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id/password", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, message: "User deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;