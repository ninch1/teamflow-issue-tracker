import { useState } from 'react';
import { loginUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import useRedirectIfLoggedIn from '../hooks/useRedirectIfLoggedIn';
import ErrorAlert from '../components/common/ErrorAlert';

// Submit login credentials and save token if login succeeds.
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const navigate = useNavigate();

  useRedirectIfLoggedIn();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not connect to server');
      }
    }
  }

  return (
    <div className='flex flex-col gap-5 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
          Welcome back
        </h1>
        <p className='text-sm text-slate-500'>
          Log in to continue to TeamFlow.
        </p>
      </div>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <input
          type='email'
          placeholder='Email'
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />
        <button
          type='submit'
          className='w-full rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] cursor-pointer'
        >
          Login
        </button>
      </form>

      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError('')} />
      )}

      <p className='text-center text-sm text-slate-500'>
        Don't have an account?{' '}
        <Link
          to='/register'
          className='font-medium text-[#5e6ad2] hover:text-[#4f5cc8]'
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
