import { getAuthToken } from "../utils/authToken";
import ApiError from "../errors/ApiError";

const BASE_URL = "http://localhost:3000/api/workspace";

export const getMembers = async (workspaceId: string) => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}/${workspaceId}/members`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Session expired. Please log in again",
      response.status,
    );
  }

  return data;
};

export const removeMember = async (workspaceId: string, memberId: string) => {
  const authToken = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/members/${memberId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Session expired. Please log in again",
      response.status,
    );
  }

  return data;
};

export const updateMemberRole = async (
  workspaceId: string,
  memberId: string,
  role: "OWNER" | "ADMIN" | "MEMBER",
) => {
  const authToken = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/members/${memberId}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ role }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not update member role",
      response.status,
    );
  }

  return data;
};

export const leaveWorkspace = async (workspaceId: string) => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}/${workspaceId}/members/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not leave workspace",
      response.status,
    );
  }

  return data;
};
