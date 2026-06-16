import ApiError from "../errors/ApiError";
import { apiFetch } from "./apiFetch";
import type {
  CreateCommentPayload,
  UpdateCommentPayload,
} from "../types/commentTypes";

const BASE_URL = "http://localhost:3000/api/workspace";

export async function getIssueComments(
  workspaceId: string,
  projectId: string,
  issueId: string,
  limit = 5,
  page = 1,
) {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues/${issueId}/comments?limit=${limit}&page=${page}`,
    {
      method: "GET",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not load comments",
      response.status,
    );
  }

  return data;
}

export async function createIssueComment(
  workspaceId: string,
  projectId: string,
  issueId: string,
  commentInfo: CreateCommentPayload,
) {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues/${issueId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentInfo),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not create comment",
      response.status,
    );
  }

  return data;
}

export async function updateIssueComment(
  workspaceId: string,
  projectId: string,
  issueId: string,
  commentId: string,
  commentInfo: UpdateCommentPayload,
) {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentInfo),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not update comment",
      response.status,
    );
  }

  return data;
}

export async function deleteIssueComment(
  workspaceId: string,
  projectId: string,
  issueId: string,
  commentId: string,
) {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
    {
      method: "DELETE",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not delete comment",
      response.status,
    );
  }

  return data;
}
