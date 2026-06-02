import { getAuthToken } from '../utils/authToken';

const BASE_URL = 'http://localhost:3000/api/workspace';

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
    throw new Error(data.error || 'Session expired. Please log in again');
  }

  return data;
};
