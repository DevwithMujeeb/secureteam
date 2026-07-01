import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getOrganization } from "../../api/organizations";
import { getProjects, createProject } from "../../api/projects";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";

const Dashboard = () => {
  const { user, currentOrg, logout } = useAuth();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  // Create project modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (!currentOrg?.id) return;
    fetchData();
  }, [currentOrg]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [orgRes, projectsRes] = await Promise.all([
        getOrganization(currentOrg.id),
        getProjects(currentOrg.id),
      ]);
      setOrg(orgRes.data.organization);
      setProjects(projectsRes.data.projects);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      await createProject(currentOrg.id, newProject);
      setShowCreateModal(false);
      setNewProject({ name: "", description: "" });
      fetchData();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-green-400 text-lg">🔒</span>
            <span className="font-bold text-white">SecureTeam</span>
            {org && (
              <>
                <span className="text-white/20">/</span>
                <span className="text-gray-300 text-sm">{org.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/organizations/${currentOrg?.id}`)}
              className="text-sm text-gray-400 hover:text-white transition-colors">
              Organization
            </button>
            <span className="text-sm text-gray-400">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 text-sm mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""} in{" "}
              {org?.name}
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            + New project
          </Button>
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <Card className="text-center py-16">
            <p className="text-gray-400 text-sm">No projects yet.</p>
            <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
              Create your first project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:border-green-400/30 hover:bg-white/8 transition-all duration-200"
                onClick={() =>
                  navigate(
                    `/organizations/${currentOrg?.id}/projects/${project.id}`,
                  )
                }>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">{project.name}</h3>
                  <Badge label={project.status} variant={project.status} />
                </div>
                {project.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                  <span>
                    {project.memberCount} member
                    {project.memberCount !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create project modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create project">
        {createError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {createError}
          </div>
        )}
        <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
          <Input
            label="Project name"
            name="name"
            value={newProject.name}
            onChange={(e) =>
              setNewProject((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="e.g. SecureTeam Dashboard"
            required
          />
          <Input
            label="Description"
            name="description"
            value={newProject.description}
            onChange={(e) =>
              setNewProject((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Optional"
          />
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
              disabled={!newProject.name}
              className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
