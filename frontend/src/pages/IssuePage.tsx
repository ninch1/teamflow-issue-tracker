import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIssue } from '../api/issueApi';

type IssueType = {
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

function getTypeClass(type: string) {
  if (type === 'BUG') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (type === 'FEATURE') {
    return 'border-blue-200 bg-blue-50 text-blue-700';
  }

  if (type === 'TASK') {
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700';
}

export default function IssuePage() {
  const { workspaceId, projectId, issueId } = useParams();

  const [currentIssue, setCurrentIssue] = useState<IssueType | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function initialIssue() {
      try {
        setError('');

        if (!workspaceId || !projectId || !issueId) {
          throw new Error('Issue not found');
        }

        const issueData = await getIssue(workspaceId, projectId, issueId);

        setCurrentIssue(issueData.issue);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Could not load issue');
        }
      }
    }

    initialIssue();
  }, [workspaceId, projectId, issueId]);

  return (
    <div className='w-full max-w-6xl'>
      {error && (
        <div className='mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
          <p>{error}</p>

          <button
            type='button'
            onClick={() => setError('')}
            className='cursor-pointer rounded px-2 text-red-500 hover:bg-red-100 hover:text-red-700'
          >
            X
          </button>
        </div>
      )}

      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <p className='mb-2 text-sm text-slate-500'>Issue</p>

        <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
          {currentIssue?.title}
        </h1>

        <p className='mt-2 text-sm text-slate-500'>
          {currentIssue?.description || 'No description yet.'}
        </p>

        <div className='mt-6 flex flex-wrap gap-2'>
          {currentIssue && (
            <>
              <span
                className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusClass(
                  currentIssue.status,
                )}`}
              >
                {currentIssue.status.replace('_', ' ')}
              </span>

              <span
                className={`rounded-full border px-2 py-1 text-xs font-medium ${getPriorityClass(
                  currentIssue.priority,
                )}`}
              >
                {currentIssue.priority}
              </span>

              <span
                className={`rounded-full border px-2 py-1 text-xs font-medium ${getTypeClass(
                  currentIssue.type,
                )}`}
              >
                {currentIssue.type}
              </span>
            </>
          )}
        </div>
      </div>

      <div className='mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500'>
        Issue actions will go here later.
      </div>
    </div>
  );
}
