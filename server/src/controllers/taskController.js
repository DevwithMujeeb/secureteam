const Task = require("../models/Task");
const AppError = require("../utils/AppError");

/**
 * POST /api/organizations/:orgId/projects/:projectId/tasks
 * Creates a task within a project. Any project member can create tasks.
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    const { orgId, projectId } = req.params;

    if (!title) throw new AppError("Task title is required", 400);

    // If assigning to someone, verify they're a project member
    if (assignedTo) {
      const isProjectMember = req.project.members.some((id) =>
        id.equals(assignedTo),
      );
      const isCreator = req.project.createdBy.equals(assignedTo);
      if (!isProjectMember && !isCreator) {
        throw new AppError("Assigned user must be a project member", 400);
      }
    }

    const task = await Task.create({
      title,
      description: description || "",
      project: projectId,
      organization: orgId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      priority: priority || "medium",
      dueDate: dueDate || null,
    });

    res.status(201).json({
      message: "Task created successfully",
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/organizations/:orgId/projects/:projectId/tasks
 * Lists all tasks in a project. Any project member can view.
 */
const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority } = req.query;

    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/organizations/:orgId/projects/:projectId/tasks/:taskId
 * Returns a single task. Any project member can view.
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) throw new AppError("Task not found", 404);
    if (!task.project.equals(req.params.projectId)) {
      throw new AppError("Task does not belong to this project", 404);
    }

    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/organizations/:orgId/projects/:projectId/tasks/:taskId
 * Updates a task. Any project member can update.
 */
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body;

    const task = await Task.findById(req.params.taskId);
    if (!task) throw new AppError("Task not found", 404);
    if (!task.project.equals(req.params.projectId)) {
      throw new AppError("Task does not belong to this project", 404);
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) {
      if (!["todo", "in_progress", "done"].includes(status)) {
        throw new AppError("Invalid status value", 400);
      }
      task.status = status;
    }
    if (priority) {
      if (!["low", "medium", "high"].includes(priority)) {
        throw new AppError("Invalid priority value", 400);
      }
      task.priority = priority;
    }
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();

    res.status(200).json({
      message: "Task updated",
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/organizations/:orgId/projects/:projectId/tasks/:taskId
 * Deletes a task. Any project member can delete.
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) throw new AppError("Task not found", 404);
    if (!task.project.equals(req.params.projectId)) {
      throw new AppError("Task does not belong to this project", 404);
    }

    await Task.deleteOne({ _id: task._id });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
