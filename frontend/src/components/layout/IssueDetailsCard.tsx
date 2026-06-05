import {
  getStatusClass,
  getPriorityClass,
  getTypeClass,
} from '../../utils/issueBadgeStyles';

type IssueDetailsCardProps = {
  issue: {
    id: string;
    title: string;
    description: string | null;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    type: 'BUG' | 'FEATURE' | 'TASK';
    projectId: string;
    createdAt: string;
    updatedAt: string;
  };
};

export default function IssueDetailsCard({ issue }: IssueDetailsCardProps) {
  return (
    <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <p className='mb-2 text-sm text-slate-500'>Issue</p>

      <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
        {issue.title}
      </h1>

      <p className='mt-2 text-sm text-slate-500'>
        {issue.description || 'No description yet.'}
      </p>

      <div className='mt-6 flex flex-wrap gap-2'>
        {issue && (
          <>
            <span
              className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusClass(
                issue.status,
              )}`}
            >
              {issue.status.replace('_', ' ')}
            </span>

            <span
              className={`rounded-full border px-2 py-1 text-xs font-medium ${getPriorityClass(
                issue.priority,
              )}`}
            >
              {issue.priority}
            </span>

            <span
              className={`rounded-full border px-2 py-1 text-xs font-medium ${getTypeClass(
                issue.type,
              )}`}
            >
              {issue.type}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
