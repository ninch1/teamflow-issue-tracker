import { useEffect, useState } from 'react';
import type { Member } from '../../types/memberTypes';
import { inviteMember } from '../../api/invitationApi';
import ApiError from '../../errors/ApiError';

type WorkspaceMembersPanelProps = {
  workspaceId: string;
  members: Member[];
  currentUserId: string;
  canManageWorkspace: boolean;
  onMemberClick: (memberId: string) => void;
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

export default function WorkspaceMembersPanel({
  workspaceId,
  members,
  currentUserId,
  canManageWorkspace,
  onMemberClick,
}: WorkspaceMembersPanelProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (!inviteError && !inviteSuccess) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setInviteError('');
      setInviteSuccess('');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [inviteError, inviteSuccess]);

  async function handleInviteMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isInviting) {
      return;
    }

    setInviteError('');
    setInviteSuccess('');

    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      setInviteError('Email is required');
      return;
    }

    try {
      setIsInviting(true);

      await inviteMember(workspaceId, email);

      setInviteEmail('');
      setInviteSuccess('Invitation sent successfully.');
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setInviteError(error.message);
      } else if (error instanceof Error) {
        setInviteError(error.message);
      } else {
        setInviteError('Could not send invitation');
      }
    } finally {
      setIsInviting(false);
    }
  }

  return (
    <div className='mt-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold text-slate-950'>
          Workspace members
        </h2>
        <p className='text-sm text-slate-500'>
          {members.length} member{members.length === 1 ? '' : 's'}
        </p>
      </div>

      {canManageWorkspace && (
        <form onSubmit={handleInviteMember} className='mb-4 space-y-2'>
          <input
            type='email'
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder='Invite by email'
            disabled={isInviting}
            className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 disabled:cursor-not-allowed disabled:opacity-60'
          />

          <button
            type='submit'
            disabled={isInviting}
            className='w-full rounded-lg bg-[#5e6ad2] px-3 py-2 text-sm font-medium text-white hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isInviting ? 'Sending...' : 'Send invite'}
          </button>

          {inviteError && <p className='text-xs text-red-600'>{inviteError}</p>}

          {inviteSuccess && (
            <p className='text-xs text-green-700'>{inviteSuccess}</p>
          )}
        </form>
      )}

      <div className='space-y-3'>
        {members.map((member) => {
          const isCurrentUser = member.user.id === currentUserId;
          return (
            <div
              key={member.id}
              onClick={() => onMemberClick(member.id)}
              className='flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3'
            >
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5e6ad2]/10 text-sm font-semibold text-[#5e6ad2]'>
                {getInitials(member.user.name, member.user.email)}
              </div>

              <div className='min-w-0 flex-1'>
                <div className='flex min-w-0 items-center gap-2'>
                  <p
                    className='truncate text-sm font-medium text-slate-950'
                    title={member.user.name || member.user.email}
                  >
                    {member.user.name || 'Unnamed user'}
                  </p>

                  {isCurrentUser && (
                    <span className='shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500'>
                      You
                    </span>
                  )}
                </div>

                <p
                  title={member.user.email}
                  className='truncate text-xs text-slate-500'
                >
                  {member.user.email}
                </p>
              </div>

              <span className='shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600'>
                {member.role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
