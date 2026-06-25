const rateLimit = require("express-rate-limit");

// Stricter limiter for login — this is the highest-value target for
// brute-force/credential-stuffing attempts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  message: { message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Looser limiter for registration — still worth capping to prevent
// automated account-creation spam, but less aggressive than login.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    message: "Too many accounts created from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, registerLimiter };
