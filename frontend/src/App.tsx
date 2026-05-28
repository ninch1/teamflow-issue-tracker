import { useState } from 'react';
import LoadState from './pages/LoadState';
import LoginPage from './pages/LoginPage';
import MePage from './pages/MePage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className='min-h-screen bg-white text-black flex items-center justify-center'>
      {!isLoaded && (
        <LoadState setIsLoggedIn={setIsLoggedIn} setIsLoaded={setIsLoaded} />
      )}
      {isLoaded && !isLoggedIn && <LoginPage setIsLoggedIn={setIsLoggedIn} />}
      {isLoggedIn && <MePage />}
    </div>
  );
}

export default App;
