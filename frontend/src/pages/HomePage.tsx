import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/authToken';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) navigate('/me');
  }, [navigate]);

  return (
    <div className='flex flex-col items-center text-center gap-4 px-4'>
      <h1 className='font-bold text-4xl bg-linear-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent'>
        TeamFlow
      </h1>
      <p className='max-w-sm text-sm text-slate-500'>
        Organize workspaces, projects, and issues with your team.
      </p>
      <div className='flex gap-5'>
        <Link
          to='/login'
          className='rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]'
        >
          Log in
        </Link>

        <Link
          to='/register'
          className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'
        >
          Register
        </Link>
      </div>
    </div>
  );
}
