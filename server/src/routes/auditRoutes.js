const express = require("express");
const { getAuditLogs } = require("../controllers/auditController");
const requireAuth = require("../middleware/requireAuth");
const requireOrgRole = require("../middleware/requireOrgRole");

const router = express.Router({ mergeParams: true }); // needed to access :orgId from parent router

router.get("/", requireAuth, requireOrgRole("owner", "admin"), getAuditLogs);

module.exports = router;
