import { useEffect } from 'react';
import { getAuthToken } from '../utils/authToken';
import { useNavigate } from 'react-router-dom';

// Checks if user is logged in
// And sends them to dashboard
export default function useRedirectIfLoggedIn() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) navigate('/dashboard');
  }, [navigate]);
}
