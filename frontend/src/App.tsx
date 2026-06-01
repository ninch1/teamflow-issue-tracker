import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MePage from './pages/MePage';

function App() {
  return (
    <div className='min-h-screen bg-slate-50 text-slate-950 flex items-center justify-center px-4'>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/me' element={<MePage />} />
      </Routes>
    </div>
  );
}

export default App;
