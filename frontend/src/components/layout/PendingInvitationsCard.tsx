import type { Invitation } from '../../types/invitationTypes';

type PendingInvitationsCardProps = {
  invitations: Invitation[];
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
  isLoading?: boolean;
  actionLoadingId?: string;
};

export default function PendingInvitationsCard({
  invitations,
  onAccept,
  onDecline,
  isLoading = false,
  actionLoadingId,
}: PendingInvitationsCardProps) {
  if (isLoading) {
    return (
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h2 className='text-xl font-semibold text-slate-950'>
          Pending invitations
        </h2>
        <p className='mt-2 text-sm text-slate-500'>Loading invitations...</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='mb-4'>
        <h2 className='text-xl font-semibold text-slate-950'>
          Pending invitations
        </h2>
        <p className='mt-1 text-sm text-slate-500'>
          Accept an invitation to join a workspace.
        </p>
      </div>

      <div className='space-y-3'>
        {invitations.map((invitation) => {
          const isActionLoading = actionLoadingId === invitation.id;

          return (
            <div
              key={invitation.id}
              className='flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between'
            >
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold text-slate-950'>
                  {invitation.workspace.name}
                </p>

                <p className='mt-1 text-xs text-slate-500'>
                  Role: {invitation.role}
                </p>
              </div>

              <div className='flex gap-2 sm:shrink-0'>
                <button
                  type='button'
                  disabled={isActionLoading}
                  onClick={() => onAccept(invitation.id)}
                  className='flex-1 rounded-lg bg-[#5e6ad2] px-3 py-2 text-sm font-medium text-white hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none'
                >
                  {isActionLoading ? 'Working...' : 'Accept'}
                </button>

                <button
                  type='button'
                  disabled={isActionLoading}
                  onClick={() => onDecline(invitation.id)}
                  className='flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none'
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
