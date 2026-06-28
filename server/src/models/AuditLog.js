const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action.
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Which organization this action happened within — every audited
    // action is scoped to an org, since that's the tenant boundary.
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    // A fixed vocabulary of action types, not free text — this keeps the
    // log queryable/filterable (e.g. "show me all role changes") rather
    // than relying on parsing arbitrary strings later.
    action: {
      type: String,
      required: true,
      enum: [
        "member.invited",
        "member.removed",
        "member.role_changed",
        "project.created",
        "project.deleted",
        "project.member_added",
        "project.member_removed",
        "organization.updated",
      ],
    },
    // The entity the action was performed on (a user being invited, a
    // project being deleted, etc.) — generic on purpose since the target
    // type varies by action.
    targetType: {
      type: String,
      enum: ["User", "Project", "Organization"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Free-form extra context for this specific event (e.g. the old and
    // new role on a role change). Kept flexible since different action
    // types need different details.
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

// Most common query: "show me the recent audit trail for this org"
auditLogSchema.index({ organization: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
