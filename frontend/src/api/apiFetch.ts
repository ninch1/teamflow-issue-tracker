import ApiError from "../errors/ApiError";
import {
  clearAuthTokens,
  getAuthToken,
} from "../utils/authToken";
import { refreshAccessToken } from "./authApi";

export const apiFetch = async (
  url: string,
  options: RequestInit = {},
) => {
  const authToken = getAuthToken();

  const headers = new Headers(options.headers);

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status !== 401) {
    return response;
  }

  try {
    const newToken = await refreshAccessToken();

    headers.set("Authorization", `Bearer ${newToken}`);

    response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  } catch {
    clearAuthTokens();
    throw new ApiError("Session expired. Please log in again", 401);
  }
};