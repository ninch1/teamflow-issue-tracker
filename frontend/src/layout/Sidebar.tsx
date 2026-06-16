import { Link } from 'react-router-dom';

type SidebarProps = {
  isMobile?: boolean;
  onNavigate?: () => void;
};

export default function Sidebar({
  isMobile = false,
  onNavigate,
}: SidebarProps) {
  const sidebarClassName = isMobile
    ? 'flex flex-col'
    : 'sticky top-0 hidden h-screen w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:flex md:flex-col';

  const linkClassName =
    'rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100';

  return (
    <aside className={sidebarClassName}>
      {!isMobile && (
        <h1 className='mb-6 text-lg font-semibold text-slate-950'>TeamFlow</h1>
      )}

      <nav className='flex flex-col gap-1'>
        <Link to='/dashboard' onClick={onNavigate} className={linkClassName}>
          Dashboard
        </Link>

        <Link to='/me' onClick={onNavigate} className={linkClassName}>
          Account
        </Link>
      </nav>
    </aside>
  );
}
