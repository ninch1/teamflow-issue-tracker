import ApiError from "../errors/ApiError";
import { apiFetch } from "./apiFetch";
import { API_BASE_URL } from "../config/api";

const BASE_URL = `${API_BASE_URL}/workspace`;

export const getWorkspaceActivities = async (
  workspaceId: string,
  limit = 3,
  page = 1,
) => {
  const response = await apiFetch(
    `${BASE_URL}/${workspaceId}/activities?limit=${limit}&page=${page}`,
    {
      method: "GET",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "Could not load workspace activity",
      response.status,
    );
  }

  return data;
};
