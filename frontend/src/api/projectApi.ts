import ApiError from "../errors/ApiError";
import { apiFetch } from "./apiFetch";

const BASE_URL = "http://localhost:3000/api/workspace";

type UpdateProjectPayload = {
  name?: string;
  description?: string;
};

export const getProjects = async (workspaceId: string) => {
  const response = await apiFetch(`${BASE_URL}/${workspaceId}/projects`, {
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

export const createProject = async (
  workspaceId: string,
  name: string,
  description: string,
) => {
  const response = await apiFetch(`${BASE_URL}/${workspaceId}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Project creation failed",
      response.status,
    );
  }

  return data;
};

export const getProject = async (workspaceId: string, projectId: string) => {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}`,
    {
      method: "GET",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || "Could not load project", response.status);
  }

  return data;
};

export const updateProject = async (
  workspaceId: string,
  projectId: string,
  payload: UpdateProjectPayload,
) => {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not update project",
      response.status,
    );
  }

  return data;
};

export const deleteProject = async (workspaceId: string, projectId: string) => {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}`,
    {
      method: "DELETE",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not delete project",
      response.status,
    );
  }

  return data;
};
