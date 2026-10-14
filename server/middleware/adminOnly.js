
const User = require("../models/User");

module.exports = async function adminOnly(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const user = await User.findById(req.user.id)
      .select("_id role")
      .lean();

    if (!user) {
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    // Use the current database role for authorization.
    req.user.role = user.role;

    next();
  } catch (err) {
    console.error("[ADMIN AUTH ERROR]", err.message);

    return res.status(500).json({
      message: "Unable to verify administrator permissions.",
    });
  }
};
