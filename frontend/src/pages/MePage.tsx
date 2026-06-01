import { useEffect, useState } from 'react';
import { getMe } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import { getAuthToken, removeAuthToken } from '../utils/authToken';

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
      const token = getAuthToken();

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
          removeAuthToken();
          setError(error.message);
        } else {
          removeAuthToken();
          setError('Could not connect to server');
        }

        navigate('/login');
      }
    }

    fetchMe();
  }, [navigate]);

  // Clear saved token and return to login page.
  function handleLogout() {
    removeAuthToken();
    navigate('/');
  }

  return (
    <div className='flex w-full max-w-sm flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
          Signed in
        </h1>
        <p className='text-sm text-slate-500'>
          Your current TeamFlow account details.
        </p>
      </div>

      {userData && (
        <div className='flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4'>
          <div>
            <p className='text-xs font-medium text-slate-500'>Name</p>
            <p className='text-sm font-medium text-slate-950'>
              {userData.user.name}
            </p>
          </div>

          <div>
            <p className='text-xs font-medium text-slate-500'>Email</p>
            <p className='text-sm text-slate-950'>{userData.user.email}</p>
          </div>

          <div>
            <p className='text-xs font-medium text-slate-500'>User ID</p>
            <p className='break-all text-sm text-slate-950'>
              {userData.user.id}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
          {error}
        </p>
      )}

      <button
        onClick={handleLogout}
        className='w-full cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100'
      >
        Logout
      </button>
    </div>
  );
}
