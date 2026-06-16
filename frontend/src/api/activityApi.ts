import ApiError from "../errors/ApiError";
import { apiFetch } from "./apiFetch";

const BASE_URL = "http://localhost:3000/api/workspace";

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
