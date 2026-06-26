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
const requireProjectAccess = require("../middleware/requireProjectAccess");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", requireAuth, (req, res) => {
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
});

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

// Temporary — proves requireProjectAccess works before we build real project routes
router.get(
  "/test-project-access/:projectId",
  requireAuth,
  requireProjectAccess,
  (req, res) => {
    res.status(200).json({
      message: "Project access granted",
      projectName: req.project.name,
    });
  },
);

module.exports = router;
