import { getAuthToken } from '../utils/authToken';
import ApiError from '../errors/ApiError';

const BASE_URL = 'http://localhost:3000/api/workspace';

export const inviteMember = async (workspaceId: string, email: string) => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}/${workspaceId}/invitations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not invite member',
      response.status,
    );
  }

  return data;
};
