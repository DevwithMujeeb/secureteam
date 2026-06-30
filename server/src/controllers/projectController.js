const Project = require("../models/Project");
const Membership = require("../models/Membership");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { logAction } = require("../utils/auditLogger");

/**
 * POST /api/organizations/:orgId/projects
 * Creates a project within the org. Creator is automatically added
 * to the project's members list. Owner/admin only.
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const { orgId } = req.params;

    if (!name) throw new AppError("Project name is required", 400);

    const project = await Project.create({
      name,
      description: description || "",
      organization: orgId,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    await logAction({
      actor: req.user._id,
      organization: orgId,
      action: "project.created",
      targetType: "Project",
      targetId: project._id,
      metadata: { projectName: name },
    });

    res.status(201).json({
      message: "Project created successfully",
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: req.user._id,
        members: project.members,
        createdAt: project.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/organizations/:orgId/projects
 * Lists all active projects in the org. Any org member can view.
 */
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      organization: req.params.orgId,
      status: "active",
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: projects.length,
      projects: projects.map((p) => ({
        id: p._id,
        name: p.name,
        description: p.description,
        status: p.status,
        createdBy: p.createdBy,
        memberCount: p.members.length,
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/organizations/:orgId/projects/:projectId
 * Returns full project details. Project members only.
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) throw new AppError("Project not found", 404);

    res.status(200).json({
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: project.createdBy,
        members: project.members,
        createdAt: project.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/organizations/:orgId/projects/:projectId
 * Updates project name, description, or status. Project members only.
 */
const updateProject = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    if (!name && description === undefined && !status) {
      throw new AppError("Nothing to update", 400);
    }

    const project = req.project;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) {
      if (!["active", "archived"].includes(status)) {
        throw new AppError("Status must be active or archived", 400);
      }
      project.status = status;
    }

    await project.save();

    res.status(200).json({
      message: "Project updated",
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        status: project.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/organizations/:orgId/projects/:projectId
 * Deletes a project. Owner/admin only. Audit-logged.
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = req.project;
    const { orgId } = req.params;

    await logAction({
      actor: req.user._id,
      organization: orgId,
      action: "project.deleted",
      targetType: "Project",
      targetId: project._id,
      metadata: { projectName: project.name },
    });

    await Project.deleteOne({ _id: project._id });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/organizations/:orgId/projects/:projectId/members
 * Adds an org member to the project. Owner/admin only. Audit-logged.
 */
const addProjectMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { orgId } = req.params;

    if (!userId) throw new AppError("userId is required", 400);

    const orgMembership = await Membership.findOne({
      user: userId,
      organization: orgId,
    });

    if (!orgMembership) {
      throw new AppError(
        "User must be an org member before being added to a project",
        400,
      );
    }

    const project = req.project;

    if (project.members.some((id) => id.equals(userId))) {
      throw new AppError("User is already a project member", 409);
    }

    project.members.push(userId);
    await project.save();

    await logAction({
      actor: req.user._id,
      organization: orgId,
      action: "project.member_added",
      targetType: "User",
      targetId: userId,
      metadata: { projectId: project._id, projectName: project.name },
    });

    res
      .status(200)
      .json({
        message: "Member added to project",
        memberCount: project.members.length,
      });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/organizations/:orgId/projects/:projectId/members/:userId
 * Removes a member from the project. Owner/admin only. Audit-logged.
 */
const removeProjectMember = async (req, res, next) => {
  try {
    const { orgId, userId } = req.params;
    const project = req.project;

    if (!project.members.some((id) => id.equals(userId))) {
      throw new AppError("User is not a project member", 404);
    }

    if (project.createdBy.equals(userId)) {
      throw new AppError(
        "Project creator cannot be removed from the project",
        400,
      );
    }

    project.members = project.members.filter((id) => !id.equals(userId));
    await project.save();

    await logAction({
      actor: req.user._id,
      organization: orgId,
      action: "project.member_removed",
      targetType: "User",
      targetId: userId,
      metadata: { projectId: project._id, projectName: project.name },
    });

    res
      .status(200)
      .json({
        message: "Member removed from project",
        memberCount: project.members.length,
      });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};
