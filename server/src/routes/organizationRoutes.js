const express = require("express");
const {
  getOrganization,
  updateOrganization,
  inviteMember,
  changeMemberRole,
  removeMember,
} = require("../controllers/organizationController");
const requireAuth = require("../middleware/requireAuth");
const requireOrgRole = require("../middleware/requireOrgRole");

const router = express.Router({ mergeParams: true });

// View org — any member can see
router.get(
  "/:orgId",
  requireAuth,
  requireOrgRole("owner", "admin", "member"),
  getOrganization,
);

// Update org details — owner/admin only
router.patch(
  "/:orgId",
  requireAuth,
  requireOrgRole("owner", "admin"),
  updateOrganization,
);

// Member management — owner/admin only
router.post(
  "/:orgId/members/invite",
  requireAuth,
  requireOrgRole("owner", "admin"),
  inviteMember,
);
router.patch(
  "/:orgId/members/:userId/role",
  requireAuth,
  requireOrgRole("owner"),
  changeMemberRole,
);
router.delete(
  "/:orgId/members/:userId",
  requireAuth,
  requireOrgRole("owner", "admin"),
  removeMember,
);

module.exports = router;
