import { useState, useEffect } from 'react';
import { registerUser } from '../api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { getAuthToken } from '../utils/authToken';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) navigate('/me');
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    try {
      await registerUser(name, email, password);
      setRegistered(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Could not connect to server');
      }
    }
  }

  if (registered) {
    return (
      <div className='flex flex-col gap-5 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
            Account created
          </h1>
          <p className='text-sm text-slate-500'>
            Your account was created successfully. Log in to continue to
            TeamFlow.
          </p>
        </div>

        <button
          className='w-full rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] cursor-pointer'
          onClick={() => navigate('/login')}
        >
          Go to login
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
          Create your account
        </h1>
        <p className='text-sm text-slate-500'>
          Start organizing your team’s work in TeamFlow.
        </p>
      </div>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <input
          type='text'
          placeholder='Elguja Modebadze'
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />
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
          Register
        </button>
      </form>
      <p className='text-center text-sm text-slate-500'>
        Already have an account?{' '}
        <Link
          to='/login'
          className='font-medium text-[#5e6ad2] hover:text-[#4f5cc8]'
        >
          Log in
        </Link>
      </p>
      {error && (
        <p className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
          {error}
        </p>
      )}
    </div>
  );
}
