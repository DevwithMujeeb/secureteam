const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/authController");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const requireAuth = require("../middleware/requireAuth");
const requireOrgRole = require("../middleware/requireOrgRole");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Temporary — proves requireAuth works before we build role checks on top of it
router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
});

// Temporary — proves requireOrgRole works before we build real org routes
router.get(
  "/test-org-role/:orgId",
  requireAuth,
  requireOrgRole("owner", "admin"),
  (req, res) => {
    res.status(200).json({
      message: "Access granted",
      yourRole: req.membership.role,
    });
  },
);

module.exports = router;
