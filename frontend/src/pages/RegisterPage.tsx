import { useState, useEffect } from 'react';
import { registerUser } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('teamflow_token');
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
      <div className='flex flex-col gap-5'>
        <h1>Registered successfully</h1>
        <button
          className='border cursor-pointer p-2 text-xl'
          onClick={() => navigate('/login')}
        >
          Go to login
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-5'>
      <h1 className='text-4xl'>Hello</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <input
          type='text'
          placeholder='Elguja Modebadze'
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='border cursor-text p-2'
        />
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
          Register
        </button>
      </form>
      {error && <p className='text-red-500'>{error}</p>}
    </div>
  );
}
