import type { Member } from '../../types/memberTypes';

type MemberInfoModalProps = {
  member: Member;
  onClose: () => void;
};

function getInitials(name: string | null | undefined, email: string) {
  if (name && name.trim()) {
    return name
      .trim()
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

export default function MemberInfoModal({
  member,
  onClose,
}: MemberInfoModalProps) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-4'>
      <button
        type='button'
        aria-label='Close member info'
        onClick={onClose}
        className='absolute inset-0 bg-slate-950/40'
      />

      <div className='relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl'>
        <div className='mb-5 flex items-start justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5e6ad2]/10 text-base font-semibold text-[#5e6ad2]'>
              {getInitials(member.user.name, member.user.email)}
            </div>

            <div className='min-w-0'>
              <h2 className='truncate text-lg font-semibold text-slate-950'>
                {member.user.name || 'Unnamed user'}
              </h2>
              <p className='truncate text-sm text-slate-500'>
                {member.user.email}
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          >
            Close
          </button>
        </div>

        <div className='space-y-3'>
          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
            <p className='text-xs font-medium uppercase tracking-wide text-slate-400'>
              Role
            </p>
            <p className='mt-1 text-sm font-medium text-slate-950'>
              {member.role}
            </p>
          </div>

          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
            <p className='text-xs font-medium uppercase tracking-wide text-slate-400'>
              Member ID
            </p>
            <p className='mt-1 break-all text-sm text-slate-700'>{member.id}</p>
          </div>

          <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
            <p className='text-xs font-medium uppercase tracking-wide text-slate-400'>
              User ID
            </p>
            <p className='mt-1 break-all text-sm text-slate-700'>
              {member.user.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
