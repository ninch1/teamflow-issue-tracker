import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('teamflow_token', data.token);
      console.log('Logged in successfully');
    } catch {
      setError('Could not connect to server');
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
