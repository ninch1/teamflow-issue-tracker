import ApiError from "../errors/ApiError";
import { apiFetch } from "./apiFetch";
import type {
  CreateLabelPayload,
  UpdateLabelPayload,
} from "../types/labelTypes";
import { API_BASE_URL } from "../config/api";

const BASE_URL = `${API_BASE_URL}/workspace`;

export async function getWorkspaceLabels(workspaceId: string) {
  const response = await apiFetch(`${BASE_URL}/${workspaceId}/labels`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || "Could not load labels", response.status);
  }

  return data;
}

export async function createWorkspaceLabel(
  workspaceId: string,
  labelInfo: CreateLabelPayload,
) {
  const response = await apiFetch(`${BASE_URL}/${workspaceId}/labels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(labelInfo),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || "Could not create label", response.status);
  }

  return data;
}

export async function addLabelToIssue(
  workspaceId: string,
  projectId: string,
  issueId: string,
  labelId: string,
) {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues/${issueId}/labels/${labelId}`,
    {
      method: "POST",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not add label to issue",
      response.status,
    );
  }

  return data;
}

export async function removeLabelFromIssue(
  workspaceId: string,
  projectId: string,
  issueId: string,
  labelId: string,
) {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues/${issueId}/labels/${labelId}`,
    {
      method: "DELETE",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not remove label from issue",
      response.status,
    );
  }

  return data;
}

export async function updateWorkspaceLabel(
  workspaceId: string,
  labelId: string,
  labelInfo: UpdateLabelPayload,
) {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/labels/${labelId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(labelInfo),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || "Could not update label", response.status);
  }

  return data;
}

export async function deleteWorkspaceLabel(
  workspaceId: string,
  labelId: string,
) {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/labels/${labelId}`,
    {
      method: "DELETE",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || "Could not delete label", response.status);
  }

  return data;
}
