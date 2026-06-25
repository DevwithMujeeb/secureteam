const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/authcontroller");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
