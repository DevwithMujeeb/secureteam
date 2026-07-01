import api from "./axios";

export const createProject = (orgId, data) =>
  api.post(`/organizations/${orgId}/projects`, data);
export const getProjects = (orgId) =>
  api.get(`/organizations/${orgId}/projects`);
export const getProject = (orgId, projectId) =>
  api.get(`/organizations/${orgId}/projects/${projectId}`);
export const updateProject = (orgId, projectId, data) =>
  api.patch(`/organizations/${orgId}/projects/${projectId}`, data);
export const deleteProject = (orgId, projectId) =>
  api.delete(`/organizations/${orgId}/projects/${projectId}`);
export const addProjectMember = (orgId, projectId, data) =>
  api.post(`/organizations/${orgId}/projects/${projectId}/members`, data);
export const removeProjectMember = (orgId, projectId, userId) =>
  api.delete(`/organizations/${orgId}/projects/${projectId}/members/${userId}`);
