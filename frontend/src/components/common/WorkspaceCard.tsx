import { Link } from 'react-router-dom';

type WorkspaceCardProps = {
  workspaceInfo: {
    id: string;
    name: string;
    description: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
};

export default function WorkspaceCard({ workspaceInfo }: WorkspaceCardProps) {
  return (
    <Link
      to={`/workspaces/${workspaceInfo.id}`}
      className='flex min-h-36 w-full cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300'
    >
      <div className='flex flex-col gap-1'>
        <h3 className='font-semibold text-slate-950'>{workspaceInfo.name}</h3>
        <p className='mb-5 line-clamp-2 text-sm text-slate-500'>
          {workspaceInfo.description || 'No description yet.'}
        </p>
      </div>

      <span className='w-fit rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'>
        {workspaceInfo.role}
      </span>
    </Link>
  );
}
