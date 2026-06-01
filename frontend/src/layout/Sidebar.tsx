import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className='hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:flex md:flex-col'>
      <h1 className='mb-6 text-lg font-semibold text-slate-950'>TeamFlow</h1>

      <nav className='flex flex-col gap-1'>
        <Link
          to='/dashboard'
          className='rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100'
        >
          Dashboard
        </Link>

        <Link
          to='/invitations'
          className='rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100'
        >
          Invitations
        </Link>
      </nav>
    </aside>
  );
}
