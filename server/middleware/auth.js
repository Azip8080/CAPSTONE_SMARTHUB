const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided. Access denied.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token provided. Access denied.",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("[AUTH ERROR] JWT_SECRET is not configured.");

    return res.status(500).json({
      message: "Server authentication is not configured.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the current user from MongoDB.
    // This ensures account status changes take effect immediately.
    const user = await User.findById(decoded.id).select(
      "_id role accountStatus"
    );

    if (!user) {
      return res.status(401).json({
        message: "User account not found. Please log in again.",
      });
    }

    // Only approved community members may access protected routes.
    // Admins and barangay personnel retain their existing access.
    if (
      user.role === "community_member" &&
      user.accountStatus !== "Active"
    ) {
      const status = user.accountStatus || "Pending";

      if (status === "Rejected") {
        return res.status(403).json({
          message:
            "Your account has been rejected. Please contact the administrator.",
          accountStatus: "Rejected",
        });
      }

      return res.status(403).json({
        message:
          "Your account is awaiting administrator approval.",
        accountStatus: "Pending",
      });
    }

    // Use current database roles rather than relying on an old JWT role.
    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please log in again.",
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token. Please log in again.",
      });
    }

    console.error("[AUTH ERROR]", err);

    return res.status(500).json({
      message: "Authentication failed. Please try again.",
    });
  }
};