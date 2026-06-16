import { useEffect, useState } from 'react';
import { getMe, logoutUser } from '../api/authApi';
import { getAuthToken, clearAuthTokens } from '../utils/authToken';
import { useNavigate } from 'react-router-dom';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiError from '../errors/ApiError';
import DangerButton from '../components/common/DangerButton';
import LoadingCard from '../components/common/LoadingCard';

type UserType = {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export default function MePage() {
  const [userData, setUserData] = useState<UserType | null>(null);
  const [pageError, setPageError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMe() {
      const token = getAuthToken();

      if (!token) {
        clearAuthTokens();
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        setPageError('');

        const data = await getMe();
        setUserData(data);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthTokens();
          navigate('/login');
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError('Could not load account details');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchMe();
  }, [navigate]);

  async function handleLogout() {
    await logoutUser();
    navigate('/');
  }

  if (isLoading) {
    return <LoadingCard message='Loading...' />;
  }

  return (
    <div className='flex min-h-[calc(100vh-7rem)] w-full items-center justify-center'>
      <div className='flex w-full max-w-sm flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
            Signed in
          </h1>
          <p className='text-sm text-slate-500'>
            Your current TeamFlow account details.
          </p>
        </div>

        {pageError && (
          <ErrorAlert message={pageError} onClose={() => setPageError('')} />
        )}

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

        <DangerButton onClick={handleLogout} fullWidth>
          Logout
        </DangerButton>
      </div>
    </div>
  );
}
