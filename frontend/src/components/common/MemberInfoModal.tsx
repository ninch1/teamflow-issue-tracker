import type { Member } from '../../types/memberTypes';

type MemberInfoModalProps = {
  member: Member;
  currentUserId: string;
  currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
  isRemoving: boolean;
  removeError: string;
  onClose: () => void;
  onRemove: () => void;
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
  currentUserId,
  currentUserRole,
  isRemoving,
  removeError,
  onClose,
  onRemove,
}: MemberInfoModalProps) {
  const isCurrentUser = member.user.id === currentUserId;

  const canRemoveMember =
    !isCurrentUser &&
    (currentUserRole === 'OWNER' ||
      (currentUserRole === 'ADMIN' && member.role === 'MEMBER'));
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
        {canRemoveMember && (
          <div className='mt-5 rounded-lg border border-red-200 bg-red-50 p-4'>
            <h3 className='text-sm font-semibold text-red-700'>
              Remove member
            </h3>
            <p className='mt-1 text-sm text-red-600'>
              This member will lose access to the workspace.
            </p>

            {removeError && (
              <p className='mt-2 text-sm font-medium text-red-700'>
                {removeError}
              </p>
            )}

            <button
              type='button'
              disabled={isRemoving}
              onClick={onRemove}
              className='mt-3 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isRemoving ? 'Removing...' : 'Remove member'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
