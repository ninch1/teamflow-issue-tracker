import { useEffect, useState } from 'react';
import { getMe } from '../api/authApi';

type UserType = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function MePage() {
  const [userData, setUserData] = useState<UserType | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMe() {
      const token = localStorage.getItem('teamflow_token');

      if (!token) {
        setError('Session expired. Please log in again');
        return;
      }

      try {
        const data = await getMe(token);
        setUserData(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          localStorage.removeItem('teamflow_token');
          setError(error.message);
        } else {
          localStorage.removeItem('teamflow_token');
          setError('Could not connect to server');
        }
      }
    }

    fetchMe();
  }, []);

  return (
    <div>
      {userData && (
        <div>
          <h1>ID: {userData.user.id}</h1>
          <h1>Name: {userData.user.name}</h1>
          <h1>Email: {userData.user.email}</h1>
        </div>
      )}
      {error && <h1>{error}</h1>}
    </div>
  );
}
