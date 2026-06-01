import { getAuthToken } from '../utils/authToken';

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
    throw new Error(data.error || 'Session expired. Please log in again');
  }

  return data;
};
