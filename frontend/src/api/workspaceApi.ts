import { getAuthToken } from '../utils/authToken';
import ApiError from '../errors/ApiError';

const BASE_URL = 'http://localhost:3000/api/workspace';

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
