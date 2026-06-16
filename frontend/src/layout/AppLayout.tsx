import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import MobileDrawer from '../components/layout/MobileDrawer';

export default function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen w-full bg-slate-50 text-slate-950'>
      <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

      <div className='flex min-h-screen'>
        <Sidebar />

        <main className='w-full min-w-0 p-4 md:p-6'>
          <div className='mx-auto w-full max-w-7xl'>
            <Outlet />
          </div>
        </main>
      </div>

      <MobileDrawer
        isOpen={isMobileSidebarOpen}
        title='Menu'
        onClose={() => setIsMobileSidebarOpen(false)}
      >
        <Sidebar isMobile onNavigate={() => setIsMobileSidebarOpen(false)} />
      </MobileDrawer>
    </div>
  );
}
