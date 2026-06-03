import { Link } from 'react-router-dom';

type IssueCardProps = {
  workspaceId: string;
  issueInfo: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
  };
};

function getStatusClass(status: string) {
  if (status === 'TODO') {
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }

  if (status === 'IN_PROGRESS') {
    return 'border-[#d8dcff] bg-[#eef0ff] text-[#5e6ad2]';
  }

  if (status === 'DONE') {
    return 'border-green-200 bg-green-50 text-green-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700';
}

function getPriorityClass(priority: string) {
  if (priority === 'LOW') {
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }

  if (priority === 'MEDIUM') {
    return 'border-yellow-200 bg-yellow-50 text-yellow-700';
  }

  if (priority === 'HIGH') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function IssueCard({ workspaceId, issueInfo }: IssueCardProps) {
  return (
    <Link
      to={`/workspaces/${workspaceId}/projects/${issueInfo.projectId}/issues/${issueInfo.id}`}
      className='flex min-h-36 w-full cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300'
    >
      <div className='flex flex-col gap-1'>
        <h3 className='font-semibold text-slate-950'>{issueInfo.title}</h3>

        <p className='line-clamp-2 text-sm text-slate-500'>
          {issueInfo.description || 'No description yet.'}
        </p>
      </div>

      <div className='flex flex-wrap gap-2'>
        <span
          className={`w-fit rounded-full border px-2 py-1 text-xs font-medium ${getStatusClass(
            issueInfo.status,
          )}`}
        >
          {issueInfo.status.replace('_', ' ')}
        </span>

        <span
          className={`w-fit rounded-full border px-2 py-1 text-xs font-medium ${getPriorityClass(
            issueInfo.priority,
          )}`}
        >
          {issueInfo.priority}
        </span>
      </div>
    </Link>
  );
}
