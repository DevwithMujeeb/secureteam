const express = require("express");
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const requireAuth = require("../middleware/requireAuth");
const requireOrgRole = require("../middleware/requireOrgRole");
const requireProjectAccess = require("../middleware/requireProjectAccess");

const router = express.Router({ mergeParams: true });

// All task routes require org membership + project access
router.use(
  requireAuth,
  requireOrgRole("owner", "admin", "member"),
  requireProjectAccess,
);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/:taskId", getTask);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

module.exports = router;
