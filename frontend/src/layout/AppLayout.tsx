import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

export default function AppLayout() {
  return (
    <div className='min-h-screen w-full bg-slate-50 text-slate-950'>
      <MobileHeader />

      <div className='flex min-h-screen'>
        <Sidebar />

        <main className='w-full p-4 md:p-6'>
          <div className='mx-auto w-full max-w-7xl'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
