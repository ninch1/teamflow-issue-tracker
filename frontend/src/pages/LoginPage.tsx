import { useState } from 'react';
import { loginUser } from '../api/authApi';

type LoginPageProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

// Submit login credentials and save token if login succeeds.
export default function LoginPage({ setIsLoggedIn }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    try {
      await loginUser(email, password);
      setIsLoggedIn(true);
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
