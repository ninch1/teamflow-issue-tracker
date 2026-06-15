import { useEffect } from 'react';

type MobileDrawerProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function MobileDrawer({
  isOpen,
  title,
  onClose,
  children,
}: MobileDrawerProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 xl:hidden'>
      <button
        type='button'
        aria-label='Close drawer overlay'
        onClick={onClose}
        className='absolute inset-0 bg-slate-950/40'
      />

      <div className='absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-slate-50 shadow-xl'>
        <div className='flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3'>
          <h2 className='text-sm font-semibold text-slate-950'>{title}</h2>

          <button
            type='button'
            onClick={onClose}
            className='rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          >
            Close
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4'>{children}</div>
      </div>
    </div>
  );
}
