const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  me,
} = require("../controllers/authcontroller");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
