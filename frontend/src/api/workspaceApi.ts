import { getAuthToken } from '../utils/authToken';
import ApiError from '../errors/ApiError';

const BASE_URL = 'http://localhost:3000/api/workspace';

type UpdateWorkspacePayload = {
  name?: string;
  description?: string;
};

export const getWorkspaces = async () => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
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

export const createWorkspace = async (name: string, description: string) => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
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
      data.error || 'Workspace creation failed',
      response.status,
    );
  }

  return data;
};

export const getWorkspace = async (id: string) => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
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

export const updateWorkspace = async (
  workspaceId: string,
  payload: UpdateWorkspacePayload,
) => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}/${workspaceId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not update workspace',
      response.status,
    );
  }

  return data;
};

export const deleteWorkspace = async (workspaceId: string) => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}/${workspaceId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not delete workspace',
      response.status,
    );
  }

  return data;
};
