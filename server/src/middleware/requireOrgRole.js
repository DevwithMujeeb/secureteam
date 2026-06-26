const Membership = require("../models/Membership");
const AppError = require("../utils/AppError");

/**
 * Checks that req.user holds one of the allowed roles within the
 * organization identified by req.params.orgId. Must run after requireAuth
 * (depends on req.user already being set).
 *
 * Usage: requireOrgRole('owner', 'admin') — allows only owners and admins.
 * Usage: requireOrgRole('owner', 'admin', 'member') — allows any member,
 * effectively just checking org membership exists at all.
 */
const requireOrgRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { orgId } = req.params;

      if (!orgId) {
        throw new AppError("Organization ID is required", 400);
      }

      const membership = await Membership.findOne({
        user: req.user._id,
        organization: orgId,
      });

      if (!membership) {
        throw new AppError("You are not a member of this organization", 403);
      }

      if (!allowedRoles.includes(membership.role)) {
        throw new AppError(
          "You do not have permission to perform this action",
          403,
        );
      }

      req.membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = requireOrgRole;
