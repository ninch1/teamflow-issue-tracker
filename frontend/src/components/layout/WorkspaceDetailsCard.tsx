type WorkspaceDetailsCardProps = {
  workspace: {
    id: string;
    name: string;
    description: string | null;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    createdAt: string;
    updatedAt: string;
  };
};

export default function WorkspaceDetailsCard({
  workspace,
}: WorkspaceDetailsCardProps) {
  return (
    <div className='mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='mb-2 text-sm text-slate-500'>Workspace</p>

          <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
            {workspace.name}
          </h1>

          <p className='mt-2 text-sm text-slate-500'>
            {workspace.description || 'No description yet.'}
          </p>
        </div>

        <span className='rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'>
          {workspace.role}
        </span>
      </div>
    </div>
  );
}
