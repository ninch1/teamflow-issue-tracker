import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className='min-h-screen w-full bg-slate-50 text-slate-950'>
      <MobileHeader />

      <div className='flex min-h-screen'>
        <Sidebar />

        <main className='w-full p-4 md:p-6'>{children}</main>
      </div>
    </div>
  );
}
