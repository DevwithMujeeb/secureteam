import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getOrganization,
  inviteMember,
  changeMemberRole,
  removeMember,
  getAuditLogs,
} from "../../api/organizations";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";

const OrganizationPage = () => {
  const { orgId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("members");

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "member" });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const currentMember = members.find((m) => m.id === user?.id);
  const isOwnerOrAdmin = ["owner", "admin"].includes(currentMember?.role);

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const orgRes = await getOrganization(orgId);
      setOrg(orgRes.data.organization);
      setMembers(orgRes.data.members);

      if (
        isOwnerOrAdmin ||
        orgRes.data.members.find(
          (m) => m.id === user?.id && ["owner", "admin"].includes(m.role),
        )
      ) {
        const logsRes = await getAuditLogs(orgId);
        setAuditLogs(logsRes.data.logs);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load organization");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    try {
      await inviteMember(orgId, inviteForm);
      setShowInviteModal(false);
      setInviteForm({ email: "", role: "member" });
      fetchData();
    } catch (err) {
      setInviteError(err.response?.data?.message || "Failed to invite member");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeMemberRole(orgId, userId, { role: newRole });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change role");
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm("Remove this member from the organization?")) return;
    try {
      await removeMember(orgId, userId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
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
            <button
              onClick={() => navigate("/dashboard")}
              className="font-bold text-white hover:text-green-400 transition-colors">
              SecureTeam
            </button>
            <span className="text-white/20">/</span>
            <span className="text-gray-300 text-sm">{org?.name}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}>
            ← Back to projects
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{org?.name}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {members.length} member{members.length !== 1 ? "s" : ""}
              {currentMember && (
                <span className="ml-2">
                  · Your role:{" "}
                  <span className="text-green-400">{currentMember.role}</span>
                </span>
              )}
            </p>
          </div>
          {isOwnerOrAdmin && (
            <Button onClick={() => setShowInviteModal(true)}>
              + Invite member
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/10">
          {["members", "audit log"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-white"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Members tab */}
        {activeTab === "members" && (
          <Card className="p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Member
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
                    Joined
                  </th>
                  {isOwnerOrAdmin && (
                    <th className="text-right px-6 py-3 text-xs text-gray-400 font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {member.name}
                          {member.id === user?.id && (
                            <span className="ml-2 text-xs text-gray-500">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge label={member.role} variant={member.role} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    {isOwnerOrAdmin && (
                      <td className="px-6 py-4 text-right">
                        {member.id !== user?.id && member.role !== "owner" && (
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleRoleChange(member.id, e.target.value)
                              }
                              className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-green-400/50">
                              <option value="member">member</option>
                              <option value="admin">admin</option>
                            </select>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemove(member.id)}>
                              Remove
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Audit log tab */}
        {activeTab === "audit log" && (
          <div className="flex flex-col gap-3">
            {auditLogs.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-400 text-sm">
                  No audit log entries yet.
                </p>
              </Card>
            ) : (
              auditLogs.map((log) => (
                <Card key={log._id} className="py-3 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-400 font-mono text-xs bg-green-400/10 px-2 py-1 rounded">
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-300">
                        by <span className="text-white">{log.actor.name}</span>
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {JSON.stringify(log.metadata)}
                    </p>
                  )}
                </Card>
              ))
            )}
          </div>
        )}
      </main>

      {/* Invite modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite member">
        {inviteError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {inviteError}
          </div>
        )}
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          <Input
            label="Email address"
            name="email"
            type="email"
            value={inviteForm.email}
            onChange={(e) =>
              setInviteForm((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="teammate@example.com"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-400 font-medium">Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm((p) => ({ ...p, role: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-green-400/50">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={inviting}
              disabled={!inviteForm.email}
              className="flex-1">
              Send invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrganizationPage;
