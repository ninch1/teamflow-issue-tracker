import ApiError from '../errors/ApiError';
import { getAuthToken } from '../utils/authToken';

const BASE_URL = 'http://localhost:3000/api/workspace';

type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH';
type IssueType = 'BUG' | 'FEATURE' | 'TASK';

type UpdateIssuePayload = {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
};

export const getIssues = async (workspaceId: string, projectId: string) => {
  const token = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Session expired. Please log in again',
      response.status,
    );
  }

  return data;
};

export const createIssue = async (
  workspaceId: string,
  projectId: string,
  title: string,
  description: string,
  priority: string,
  type: string,
) => {
  const token = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        priority,
        type,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'Issue creation failed', response.status);
  }

  return data;
};

export const getIssue = async (
  workspaceId: string,
  projectId: string,
  issueId: string,
) => {
  const token = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues/${issueId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'Could not load issue', response.status);
  }

  return data;
};

export const updateIssue = async (
  workspaceId: string,
  projectId: string,
  issueId: string,
  payload: UpdateIssuePayload,
) => {
  const token = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues/${issueId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'Could not update issue', response.status);
  }

  return data;
};

export const deleteIssue = async (
  workspaceId: string,
  projectId: string,
  issueId: string,
) => {
  const token = getAuthToken();

  const response = await fetch(
    `${BASE_URL}/${workspaceId}/projects/${projectId}/issues/${issueId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'Could not delete issue', response.status);
  }

  return data;
};
