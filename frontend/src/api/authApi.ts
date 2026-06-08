import { getAuthToken, setAuthToken } from '../utils/authToken';
import ApiError from '../errors/ApiError';

// API functions for authentication requests.

const BASE_URL = 'http://localhost:3000/api/auth';

export const getMe = async () => {
  const authToken = getAuthToken();

  const response = await fetch(`${BASE_URL}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
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
};
