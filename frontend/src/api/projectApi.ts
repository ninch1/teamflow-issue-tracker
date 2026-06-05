import ApiError from '../errors/ApiError';
import { getAuthToken } from '../utils/authToken';

const BASE_URL = 'http://localhost:3000/api/workspace';

type UpdateProjectPayload = {
  name?: string;
  description?: string;
};

export const getProjects = async (workspaceId: string) => {
  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}/${workspaceId}/projects`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Session expired. Please log in again',
      response.status,
    );
  }

  return data;
};

export const createProject = async (
  workspaceId: string,
  name: string,
  description: string,
) => {
  const token = getAuthToken();

  const response = await fetch(`${BASE_URL}/${workspaceId}/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Project creation failed',
      response.status,
    );
  }

  return data;
};

export const getProject = async (workspaceId: string, projectId: string) => {
  const token = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'Could not load project', response.status);
  }

  return data;
};

export const updateProject = async (
  workspaceId: string,
  projectId: string,
  payload: UpdateProjectPayload,
) => {
  const token = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not update project',
      response.status,
    );
  }

  return data;
};

export const deleteProject = async (workspaceId: string, projectId: string) => {
  const token = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not delete project',
      response.status,
    );
  }

  return data;
};
