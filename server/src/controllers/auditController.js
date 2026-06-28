const AuditLog = require("../models/AuditLog");
const AppError = require("../utils/AppError");

/**
 * GET /api/organizations/:orgId/audit-logs
 * Returns the audit trail for an organization, most recent first.
 * Restricted to owner/admin via requireOrgRole at the route level —
 * regular members should not be able to see this.
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { orgId } = req.params;

    const logs = await AuditLog.find({ organization: orgId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("actor", "name email");

    res.status(200).json({
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs };
