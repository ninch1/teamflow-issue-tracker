import ApiError from '../errors/ApiError';
import { getAuthToken } from '../utils/authToken';

const BASE_URL = 'http://localhost:3000/api/workspace';

export const getWorkspaceActivities = async (workspaceId: string) => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}/${workspaceId}/activities`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not load workspace activity',
      response.status,
    );
  }

  return data;
};
