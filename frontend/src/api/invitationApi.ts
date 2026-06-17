import { apiFetch } from "./apiFetch";
import ApiError from "../errors/ApiError";
import { API_BASE_URL } from "../config/api";

const WORKSPACE_BASE_URL = `${API_BASE_URL}/workspace`;
const INVITATION_BASE_URL = `${API_BASE_URL}/invitations`;

export const inviteMember = async (workspaceId: string, email: string) => {
  const response = await apiFetch(
    `${WORKSPACE_BASE_URL}/${workspaceId}/invitations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not invite member",
      response.status,
    );
  }

  return data;
};

export const getInvitations = async () => {
  const response = await apiFetch(`${INVITATION_BASE_URL}/me`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not load invitations",
      response.status,
    );
  }

  return data;
};

export const acceptInvitation = async (invitationId: string) => {
  const response = await apiFetch(
    `${INVITATION_BASE_URL}/${invitationId}/accept`,
    {
      method: "PATCH",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not accept invitation",
      response.status,
    );
  }

  return data;
};

export const declineInvitation = async (invitationId: string) => {
  const response = await apiFetch(
    `${INVITATION_BASE_URL}/${invitationId}/decline`,
    {
      method: "PATCH",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not decline invitation",
      response.status,
    );
  }

  return data;
};
