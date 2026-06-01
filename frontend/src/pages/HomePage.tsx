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
      <p>Organize workspaces, projects, and issues with your team.</p>
      <div className='flex gap-5'>
        <Link to='/login' className='border cursor-pointer p-2 text-xl'>
          Log in
        </Link>

        <Link to='/register' className='border cursor-pointer p-2 text-xl'>
          Register
        </Link>
      </div>
    </div>
  );
}
