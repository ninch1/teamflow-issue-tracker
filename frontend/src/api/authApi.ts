import {
  setAuthToken,
  setRefreshToken,
  getRefreshToken,
  clearAuthTokens,
} from '../utils/authToken';
import ApiError from '../errors/ApiError';
import { apiFetch } from './apiFetch';

// API functions for authentication requests.

const BASE_URL = 'http://localhost:3000/api/auth';

export const getMe = async () => {
  const response = await apiFetch(`${BASE_URL}/me`, {
    method: 'GET',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Session expired. Please log in again',
      response.status,
    );
  }

  return data;
};

export const updateMe = async (name: string, email: string) => {
  const response = await apiFetch(`${BASE_URL}/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || 'Could not update profile',
      response.status,
    );
  }

  return data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  setAuthToken(data.token);
  setRefreshToken(data.refreshToken);
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  setAuthToken(data.token);
  setRefreshToken(data.refreshToken);
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new ApiError('Refresh token not found', 401);
  }

  const response = await fetch(`${BASE_URL}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    clearAuthTokens();
    throw new ApiError(data.error || 'Session expired', response.status);
  }

  setAuthToken(data.token);

  return data.token;
};

export const logoutUser = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthTokens();
    return;
  }

  await fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  clearAuthTokens();
};
