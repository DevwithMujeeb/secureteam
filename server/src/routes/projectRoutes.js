const express = require("express");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} = require("../controllers/projectController");
const requireAuth = require("../middleware/requireAuth");
const requireOrgRole = require("../middleware/requireOrgRole");
const requireProjectAccess = require("../middleware/requireProjectAccess");

const router = express.Router({ mergeParams: true });

// Org-scoped project routes
router.post("/", requireAuth, requireOrgRole("owner", "admin"), createProject);
router.get(
  "/",
  requireAuth,
  requireOrgRole("owner", "admin", "member"),
  getProjects,
);

// Project-scoped routes — requireProjectAccess checks membership at project level
router.get(
  "/:projectId",
  requireAuth,
  requireOrgRole("owner", "admin", "member"),
  requireProjectAccess,
  getProject,
);
router.patch(
  "/:projectId",
  requireAuth,
  requireOrgRole("owner", "admin", "member"),
  requireProjectAccess,
  updateProject,
);
router.delete(
  "/:projectId",
  requireAuth,
  requireOrgRole("owner", "admin"),
  requireProjectAccess,
  deleteProject,
);

// Project member management
router.post(
  "/:projectId/members",
  requireAuth,
  requireOrgRole("owner", "admin"),
  requireProjectAccess,
  addProjectMember,
);
router.delete(
  "/:projectId/members/:userId",
  requireAuth,
  requireOrgRole("owner", "admin"),
  requireProjectAccess,
  removeProjectMember,
);

module.exports = router;
