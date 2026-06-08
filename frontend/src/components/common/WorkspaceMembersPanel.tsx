import type { Member } from '../../types/memberTypes';

type WorkspaceMembersPanelProps = {
  members: Member[];
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
  members,
}: WorkspaceMembersPanelProps) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white mt-10 p-5 shadow-sm'>
      {/* using mt-10 to match mb-4 of BackLink and p-6 of AppLayout */}
      <div className='mb-4'>
        <h2 className='text-lg font-semibold text-slate-950'>
          Workspace members
        </h2>
        <p className='text-sm text-slate-500'>
          {members.length} member{members.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className='space-y-3'>
        {members.map((member) => (
          <div
            key={member.id}
            className='flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3'
          >
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5e6ad2]/10 text-sm font-semibold text-[#5e6ad2]'>
              {getInitials(member.user.name, member.user.email)}
            </div>

            <div className='min-w-0 max-w-35 flex-1'>
              <p
                title={member.user.name || 'Unnamed user'}
                className='truncate text-sm font-medium text-slate-950'
              >
                {member.user.name || 'Unnamed user'}
              </p>

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
        ))}
      </div>
    </div>
  );
}
