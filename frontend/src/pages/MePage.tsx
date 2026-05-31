import { useEffect, useState } from 'react';
import { getMe } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

type UserType = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

// Load current user using the saved token.
export default function MePage() {
  const [userData, setUserData] = useState<UserType | null>(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Load current user using saved token.
  useEffect(() => {
    async function fetchMe() {
      const token = localStorage.getItem('teamflow_token');

      if (!token) {
        setError('Session expired. Please log in again');
        navigate('/login');
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

        navigate('/login');
      }
    }

    fetchMe();
  }, [navigate]);

  // Clear saved token and return to login page.
  function handleLogout() {
    localStorage.removeItem('teamflow_token');
    navigate('/login');
  }

  return (
    <div className='flex flex-col gap-10'>
      {userData && (
        <div className='border-5 p-5 rounded-xl border-blue-300'>
          <h1>ID: {userData.user.id}</h1>
          <h1>Name: {userData.user.name}</h1>
          <h1>Email: {userData.user.email}</h1>
        </div>
      )}
      {error && <h1>{error}</h1>}
      <button
        onClick={handleLogout}
        className='max-w-30 mx-auto border py-2 px-5 rounded-md cursor-pointer hover:bg-red-600 hover:text-white'
      >
        Logout
      </button>
    </div>
  );
}
