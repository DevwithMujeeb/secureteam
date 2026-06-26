const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");
const AppError = require("../utils/AppError");

/**
 * Verifies the Authorization header's Bearer access token and attaches
 * the authenticated user to req.user. Every protected route depends on
 * this running first — it's the foundation every other auth check builds on.
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      throw new AppError("Invalid or expired access token", 401);
    }

    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      throw new AppError("User no longer exists or is inactive", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireAuth;
