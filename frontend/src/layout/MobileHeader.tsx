type MobileHeaderProps = {
  onMenuClick: () => void;
};

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className='sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden'>
      <h1 className='text-lg font-semibold text-slate-950'>TeamFlow</h1>

      <button
        type='button'
        onClick={onMenuClick}
        className='rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100'
      >
        Menu
      </button>
    </header>
  );
}
