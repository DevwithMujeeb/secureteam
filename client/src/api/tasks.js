import api from "./axios";

export const createTask = (orgId, projectId, data) =>
  api.post(`/organizations/${orgId}/projects/${projectId}/tasks`, data);
export const getTasks = (orgId, projectId) =>
  api.get(`/organizations/${orgId}/projects/${projectId}/tasks`);
export const getTask = (orgId, projectId, taskId) =>
  api.get(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`);
export const updateTask = (orgId, projectId, taskId, data) =>
  api.patch(
    `/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`,
    data,
  );
export const deleteTask = (orgId, projectId, taskId) =>
  api.delete(`/organizations/${orgId}/projects/${projectId}/tasks/${taskId}`);
