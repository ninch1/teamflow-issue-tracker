import { useState, useEffect } from 'react';
import { loginUser } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/authToken';

// Submit login credentials and save token if login succeeds.
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (token) navigate('/me');
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    try {
      await loginUser(email, password);
      navigate('/me');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Could not connect to server');
      }
    }
  }

  return (
    <div className='flex flex-col gap-5'>
      <h1 className='text-4xl'>Hello</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <input
          type='email'
          placeholder='Email'
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className='border cursor-text p-2'
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='border cursor-text p-2'
        />
        <button type='submit' className='border cursor-pointer p-2 text-xl'>
          Login
        </button>
      </form>
      {error && <p className='text-red-500'>{error}</p>}
    </div>
  );
}
