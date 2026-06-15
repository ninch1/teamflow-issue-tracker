import type { Member } from '../../types/memberTypes';

type IssueAssigneeSectionProps = {
  assigneeId: string | null;
  members: Member[];
  canManageWorkspace: boolean;
  isSubmitting: boolean;
  onAssigneeChange: (assigneeId: string | null) => void;
  onSubmit: () => void;
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

export default function IssueAssigneeSection({
  assigneeId,
  members,
  canManageWorkspace,
  isSubmitting,
  onAssigneeChange,
  onSubmit,
}: IssueAssigneeSectionProps) {
  const selectedMember =
    members.find((member) => member.id === assigneeId) ?? null;

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div>
        <h2 className='text-lg font-semibold text-slate-950'>Assignee</h2>
        <p className='text-sm text-slate-500'>
          Choose who is responsible for this issue.
        </p>
      </div>

      <div className='mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3'>
        {selectedMember ? (
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5e6ad2]/10 text-sm font-semibold text-[#5e6ad2]'>
              {getInitials(selectedMember.user.name, selectedMember.user.email)}
            </div>

            <div className='min-w-0 flex-1'>
              <p
                className='truncate text-sm font-medium text-slate-950'
                title={selectedMember.user.name || selectedMember.user.email}
              >
                {selectedMember.user.name || 'Unnamed user'}
              </p>
              <p
                className='truncate text-xs text-slate-500'
                title={selectedMember.user.email}
              >
                {selectedMember.user.email}
              </p>
            </div>

            <span className='shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600'>
              {selectedMember.role}
            </span>
          </div>
        ) : (
          <p className='text-sm text-slate-500'>No one assigned yet.</p>
        )}
      </div>

      {canManageWorkspace && (
        <div className='mt-4 space-y-3'>
          <select
            value={assigneeId ?? ''}
            onChange={(e) => onAssigneeChange(e.target.value || null)}
            disabled={isSubmitting}
            className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <option value=''>Unassigned</option>

            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.user.name || member.user.email} — {member.role}
              </option>
            ))}
          </select>

          <button
            type='button'
            disabled={isSubmitting}
            onClick={onSubmit}
            className='w-full rounded-lg bg-[#5e6ad2] px-3 py-2 text-sm font-medium text-white hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isSubmitting ? 'Saving...' : 'Update assignee'}
          </button>
        </div>
      )}

      {!canManageWorkspace && (
        <p className='mt-3 text-sm text-slate-500'>
          Only workspace owners and admins can change the assignee.
        </p>
      )}
    </section>
  );
}
