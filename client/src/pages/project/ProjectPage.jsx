import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProject } from "../../api/projects";
import { getTasks, createTask, updateTask, deleteTask } from "../../api/tasks";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

const ProjectPage = () => {
  const { orgId, projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // Create task modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        getProject(orgId, projectId),
        getTasks(orgId, projectId),
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      await createTask(orgId, projectId, newTask);
      setShowCreateModal(false);
      setNewTask({ title: "", description: "", priority: "medium" });
      fetchData();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(orgId, projectId, taskId, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteTask(orgId, projectId, taskId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-lg">🔒</span>
            <button
              onClick={() => navigate("/dashboard")}
              className="font-bold text-white hover:text-green-400 transition-colors">
              SecureTeam
            </button>
            <span className="text-white/20">/</span>
            <button
              onClick={() => navigate(`/organizations/${orgId}`)}
              className="text-gray-300 text-sm hover:text-white transition-colors">
              Organization
            </button>
            <span className="text-white/20">/</span>
            <span className="text-gray-300 text-sm">{project?.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}>
            ← Back to projects
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
              <Badge label={project?.status} variant={project?.status} />
            </div>
            {project?.description && (
              <p className="text-gray-400 text-sm">{project.description}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} ·{" "}
              {project?.members?.length} member
              {project?.members?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>+ New task</Button>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((col) => (
            <div key={col.key}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  {col.label}
                </h3>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                  {tasksByStatus(col.key).length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {tasksByStatus(col.key).length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-xl p-6 text-center">
                    <p className="text-gray-600 text-xs">No tasks</p>
                  </div>
                ) : (
                  tasksByStatus(col.key).map((task) => (
                    <Card
                      key={task._id}
                      className="py-4 px-4 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-white leading-snug">
                          {task.title}
                        </p>
                        <Badge label={task.priority} variant={task.priority} />
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      {task.assignedTo && (
                        <p className="text-xs text-gray-500 mb-3">
                          Assigned to {task.assignedTo.name}
                        </p>
                      )}
                      {/* Status controls */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task._id, e.target.value)
                          }
                          className="flex-1 text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-green-400/50">
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1">
                          Delete
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Create task modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create task">
        {createError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {createError}
          </div>
        )}
        <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
          <Input
            label="Title"
            name="title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="What needs to be done?"
            required
          />
          <Input
            label="Description"
            name="description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Optional details"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400 font-medium">
              Priority
            </label>
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask((p) => ({ ...p, priority: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={creating}
              disabled={!newTask.title}
              className="flex-1">
              Create task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectPage;
