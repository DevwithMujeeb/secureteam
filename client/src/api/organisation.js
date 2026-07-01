import api from "./axios";

export const getOrganization = (orgId) => api.get(`/organizations/${orgId}`);
export const updateOrganization = (orgId, data) =>
  api.patch(`/organizations/${orgId}`, data);
export const inviteMember = (orgId, data) =>
  api.post(`/organizations/${orgId}/members/invite`, data);
export const changeMemberRole = (orgId, userId, data) =>
  api.patch(`/organizations/${orgId}/members/${userId}/role`, data);
export const removeMember = (orgId, userId) =>
  api.delete(`/organizations/${orgId}/members/${userId}`);
export const getAuditLogs = (orgId) =>
  api.get(`/organizations/${orgId}/audit-logs`);
