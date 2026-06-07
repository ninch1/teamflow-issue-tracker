import { getAuthToken } from '../utils/authToken';
import ApiError from '../errors/ApiError';

const BASE_URL = 'http://localhost:3000/api/workspace';

export const getMembers = async (workspaceId: string) => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}/${workspaceId}/members`, {
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
