const AuditLog = require("../models/AuditLog");

/**
 * Records a single audit log entry. Called from controllers immediately
 * after a privileged action succeeds. Deliberately does NOT throw on
 * failure — a logging failure should never block or roll back the actual
 * action it's describing; we log the logging failure itself instead and
 * move on, so an audit-log outage can't become an availability outage.
 */
const logAction = async ({
  actor,
  organization,
  action,
  targetType,
  targetId,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      actor,
      organization,
      action,
      targetType,
      targetId,
      metadata,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
};

module.exports = { logAction };
