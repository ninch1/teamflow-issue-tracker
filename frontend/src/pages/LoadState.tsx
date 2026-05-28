import { useEffect } from 'react';

type LoadStateProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LoadState({
  setIsLoggedIn,
  setIsLoaded,
}: LoadStateProps) {
  useEffect(() => {
    const token = localStorage.getItem('teamflow_token');

    if (!token) {
      setIsLoggedIn(false);
      setIsLoaded(true);
      return;
    }

    setIsLoggedIn(true);
    setIsLoaded(true);
  }, []);

  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
}
