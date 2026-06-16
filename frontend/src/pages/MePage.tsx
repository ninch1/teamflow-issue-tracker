import { useEffect, useState } from 'react';
import { getMe, logoutUser, updateMe } from '../api/authApi';
import { getAuthToken, clearAuthTokens } from '../utils/authToken';
import { useNavigate } from 'react-router-dom';
import SuccessAlert from '../components/common/SuccessAlert';
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
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
        setEditName(data.user.name);
        setEditEmail(data.user.email);
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

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isUpdatingProfile) {
      return;
    }

    setPageError('');
    setSuccessMessage('');

    if (!editName.trim()) {
      setPageError('Name is required');
      return;
    }

    if (!editEmail.trim()) {
      setPageError('Email is required');
      return;
    }

    try {
      setIsUpdatingProfile(true);

      const data = await updateMe(editName, editEmail);

      setUserData({ user: data.user });
      setEditName(data.user.name);
      setEditEmail(data.user.email);
      setSuccessMessage('Profile updated successfully.');
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthTokens();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setPageError(error.message);
      } else {
        setPageError('Could not update profile');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  }

  async function handleLogout() {
    await logoutUser();
    navigate('/');
  }

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [successMessage]);

  useEffect(() => {
    if (!pageError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPageError('');
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pageError]);

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

        {successMessage && (
          <SuccessAlert
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {userData && (
          <form
            onSubmit={handleUpdateProfile}
            className='flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4'
          >
            <div>
              <label className='text-xs font-medium text-slate-500'>Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-500'
              />
            </div>

            <div>
              <label className='text-xs font-medium text-slate-500'>
                Email
              </label>
              <input
                type='email'
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-indigo-500'
              />
            </div>

            <div>
              <p className='text-xs font-medium text-slate-500'>User ID</p>
              <p className='break-all text-sm text-slate-950'>
                {userData.user.id}
              </p>
            </div>

            <button
              type='submit'
              disabled={isUpdatingProfile}
              className='mt-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isUpdatingProfile ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        )}

        <DangerButton onClick={handleLogout} fullWidth>
          Logout
        </DangerButton>
      </div>
    </div>
  );
}
