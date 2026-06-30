const Organization = require("../models/Organization");
const Membership = require("../models/Membership");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { logAction } = require("../utils/auditLogger");

/**
 * GET /api/organizations/:orgId
 * Returns org details + current member list. Any org member can view.
 */
const getOrganization = async (req, res, next) => {
  try {
    const org = await Organization.findById(req.params.orgId).populate(
      "owner",
      "name email",
    );

    if (!org) {
      throw new AppError("Organization not found", 404);
    }

    const members = await Membership.find({ organization: req.params.orgId })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      organization: {
        id: org._id,
        name: org.name,
        description: org.description,
        owner: org.owner,
        createdAt: org.createdAt,
      },
      members: members.map((m) => ({
        id: m.user._id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        joinedAt: m.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/organizations/:orgId
 * Updates org name or description. Owner/admin only.
 */
const updateOrganization = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name && description === undefined) {
      throw new AppError(
        "Nothing to update — provide name or description",
        400,
      );
    }

    const org = await Organization.findById(req.params.orgId);
    if (!org) throw new AppError("Organization not found", 404);

    if (name) org.name = name;
    if (description !== undefined) org.description = description;
    await org.save();

    await logAction({
      actor: req.user._id,
      organization: org._id,
      action: "organization.updated",
      targetType: "Organization",
      targetId: org._id,
      metadata: { updatedFields: Object.keys(req.body) },
    });

    res.status(200).json({
      message: "Organization updated",
      organization: {
        id: org._id,
        name: org.name,
        description: org.description,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/organizations/:orgId/members/invite
 * Invites an existing user to the org by email, with a specified role.
 * Owner/admin only. Audit-logged.
 */
const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      throw new AppError("Email and role are required", 400);
    }

    if (!["admin", "member"].includes(role)) {
      throw new AppError("Role must be admin or member", 400);
    }

    const invitee = await User.findOne({ email });
    if (!invitee) {
      throw new AppError("No account found with that email address", 404);
    }

    const existing = await Membership.findOne({
      user: invitee._id,
      organization: req.params.orgId,
    });

    if (existing) {
      throw new AppError(
        "This user is already a member of the organization",
        409,
      );
    }

    const membership = await Membership.create({
      user: invitee._id,
      organization: req.params.orgId,
      role,
    });

    await logAction({
      actor: req.user._id,
      organization: req.params.orgId,
      action: "member.invited",
      targetType: "User",
      targetId: invitee._id,
      metadata: { email: invitee.email, role },
    });

    res.status(201).json({
      message: `${invitee.name} added to organization as ${role}`,
      member: {
        id: invitee._id,
        name: invitee.name,
        email: invitee.email,
        role: membership.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/organizations/:orgId/members/:userId/role
 * Changes a member's role. Owner only — admins cannot promote others to
 * owner or change other admins. Audit-logged.
 */
const changeMemberRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { orgId, userId } = req.params;

    if (!role) throw new AppError("Role is required", 400);

    if (!["admin", "member"].includes(role)) {
      throw new AppError(
        "Role must be admin or member — owner cannot be assigned directly",
        400,
      );
    }

    if (userId === req.user._id.toString()) {
      throw new AppError("You cannot change your own role", 400);
    }

    const membership = await Membership.findOne({
      user: userId,
      organization: orgId,
    });
    if (!membership)
      throw new AppError("User is not a member of this organization", 404);

    if (membership.role === "owner") {
      throw new AppError("The owner role cannot be changed this way", 400);
    }

    const oldRole = membership.role;
    membership.role = role;
    await membership.save();

    await logAction({
      actor: req.user._id,
      organization: orgId,
      action: "member.role_changed",
      targetType: "User",
      targetId: userId,
      metadata: { oldRole, newRole: role },
    });

    res.status(200).json({
      message: "Role updated successfully",
      userId,
      oldRole,
      newRole: role,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/organizations/:orgId/members/:userId
 * Removes a member from the org. Owner/admin only. Owners cannot be
 * removed — they must transfer ownership first. Audit-logged.
 */
const removeMember = async (req, res, next) => {
  try {
    const { orgId, userId } = req.params;

    if (userId === req.user._id.toString()) {
      throw new AppError(
        "You cannot remove yourself from the organization",
        400,
      );
    }

    const membership = await Membership.findOne({
      user: userId,
      organization: orgId,
    });
    if (!membership)
      throw new AppError("User is not a member of this organization", 404);

    if (membership.role === "owner") {
      throw new AppError(
        "The owner cannot be removed from the organization",
        400,
      );
    }

    await Membership.deleteOne({ user: userId, organization: orgId });

    await logAction({
      actor: req.user._id,
      organization: orgId,
      action: "member.removed",
      targetType: "User",
      targetId: userId,
      metadata: { removedRole: membership.role },
    });

    res.status(200).json({ message: "Member removed successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrganization,
  updateOrganization,
  inviteMember,
  changeMemberRole,
  removeMember,
};
