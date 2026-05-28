import { useEffect, useState } from 'react';

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
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem('teamflow_token');
          setError(data.error || 'Session expired. Please log in again');
          return;
        }

        setUserData(data);
      } catch {
        setError('Could not connect to server');
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
