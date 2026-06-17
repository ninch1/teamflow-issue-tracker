import { apiFetch } from "./apiFetch";
import ApiError from "../errors/ApiError";
import { API_BASE_URL } from "../config/api";

const BASE_URL = `${API_BASE_URL}/workspace`;

export const getMembers = async (workspaceId: string) => {
  const response = await apiFetch(`${BASE_URL}/${workspaceId}/members`, {
    method: "GET",
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
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/members/${memberId}`,
    {
      method: "DELETE",
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
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/members/${memberId}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
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
  const response = await apiFetch(`${BASE_URL}/${workspaceId}/members/me`, {
    method: "DELETE",
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
