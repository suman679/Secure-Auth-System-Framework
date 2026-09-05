// ==============================================
// middleware/auth.js - JWT Protection Middleware
// ==============================================
// This function runs BEFORE protected routes
// It checks if the user has a valid JWT token

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Get the token from the request header
  // Frontend sends it as: Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Split "Bearer <token>" and get just the token part
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. Invalid token format." });
  }

  try {
    // Verify the token using our secret key
    // This will throw an error if token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request object
    // Now any route using this middleware can access req.user
    req.user = decoded;

    // Call next() to continue to the actual route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token. Please login again." });
  }
};

module.exports = verifyToken;
