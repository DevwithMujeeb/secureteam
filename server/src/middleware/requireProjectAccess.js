const Project = require("../models/Project");
const AppError = require("../utils/AppError");

/**
 * Checks that req.user has access to the project identified by
 * req.params.projectId — either as the creator, or by being listed in
 * the project's members array. This is deliberately independent of
 * org-level role: being an org 'member' (or even 'admin') does NOT
 * automatically grant project access. Access is explicit, per project.
 *
 * Must run after requireAuth.
 */
const requireProjectAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      throw new AppError("Project ID is required", 400);
    }

    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const isCreator = project.createdBy.equals(req.user._id);
    const isMember = project.members.some((memberId) =>
      memberId.equals(req.user._id),
    );

    if (!isCreator && !isMember) {
      throw new AppError("You do not have access to this project", 403);
    }

    // Attach for downstream controllers (e.g. to check isCreator for edit rights)
    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireProjectAccess;
