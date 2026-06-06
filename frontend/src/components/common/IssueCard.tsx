import { Link } from 'react-router-dom';
import { getStatusClass, getPriorityClass } from '../../utils/issueBadgeStyles';
import type { Issue } from '../../types/issueTypes';

type IssueCardProps = {
  workspaceId: string;
  issueInfo: Issue;
};

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
