
const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
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

    req.user = decoded;

    next();
  } catch (err) {
    console.error("[AUTH DEBUG] JWT verification failed:", err.name);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please log in again.",
      });
    }

    return res.status(401).json({
      message: "Invalid token. Please log in again.",
    });
  }
};