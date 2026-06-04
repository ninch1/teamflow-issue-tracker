import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIssue, updateIssue } from '../api/issueApi';
import ErrorAlert from '../components/common/ErrorAlert';

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
  const [newStatus, setNewStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>(
    'TODO',
  );

  useEffect(() => {
    async function initialIssue() {
      try {
        setError('');

        if (!workspaceId || !projectId || !issueId) {
          throw new Error('Issue not found');
        }

        const issueData = await getIssue(workspaceId, projectId, issueId);

        setCurrentIssue(issueData.issue);
        setNewStatus(issueData.issue.status);
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

  // Update Issue Status
  async function handleUpdateStatus() {
    setError('');

    if (!workspaceId || !projectId || !issueId) {
      setError('Issue not found');
      return;
    }

    try {
      const updatedIssueData = await updateIssue(
        workspaceId,
        projectId,
        issueId,
        newStatus,
      );

      setCurrentIssue(updatedIssueData.issue);
      setNewStatus(updatedIssueData.issue.status);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Could not update issue');
      }
    }
  }

  return (
    <div className='w-full max-w-6xl'>
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

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

      <div className='mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-950'>
        <h2 className='text-xl font-semibold mb-2.5'>Update Status</h2>
        <select
          value={newStatus}
          onChange={(e) =>
            setNewStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')
          }
          className='mr-5 w-full max-w-max rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        >
          <option value='TODO'>TODO</option>
          <option value='IN_PROGRESS'>In Progress</option>
          <option value='DONE'>DONE</option>
        </select>
        <button
          onClick={handleUpdateStatus}
          className='rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] hover:cursor-pointer'
        >
          Update
        </button>
      </div>
    </div>
  );
}
