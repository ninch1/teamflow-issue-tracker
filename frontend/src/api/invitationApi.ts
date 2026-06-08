import { getAuthToken } from '../utils/authToken';
import ApiError from '../errors/ApiError';

const WORKSPACE_BASE_URL = 'http://localhost:3000/api/workspace';
const INVITATION_BASE_URL = 'http://localhost:3000/api/invitations';

export const inviteMember = async (workspaceId: string, email: string) => {
  const authToken = getAuthToken();

  const response = await fetch(
    `${WORKSPACE_BASE_URL}/${workspaceId}/invitations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ email }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not invite member',
      response.status,
    );
  }

  return data;
};

export const getInvitations = async () => {
  const authToken = getAuthToken();

  const response = await fetch(`${INVITATION_BASE_URL}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not load invitations',
      response.status,
    );
  }

  return data;
};

export const acceptInvitation = async (invitationId: string) => {
  const authToken = getAuthToken();

  const response = await fetch(
    `${INVITATION_BASE_URL}/${invitationId}/accept`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not accept invitation',
      response.status,
    );
  }

  return data;
};

export const declineInvitation = async (invitationId: string) => {
  const authToken = getAuthToken();

  const response = await fetch(
    `${INVITATION_BASE_URL}/${invitationId}/decline`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not decline invitation',
      response.status,
    );
  }

  return data;
};
