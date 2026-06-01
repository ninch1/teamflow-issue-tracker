export default function MobileHeader() {
  return (
    <header className='flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden'>
      <h1 className='text-lg font-semibold text-slate-950'>TeamFlow</h1>
      <button className='text-sm text-slate-600'>Menu</button>
    </header>
  );
}
