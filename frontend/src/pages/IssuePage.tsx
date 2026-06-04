import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getIssue, updateIssue } from '../api/issueApi';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';
import {
  getStatusClass,
  getPriorityClass,
  getTypeClass,
} from '../utils/issueBadgeStyles';

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

export default function IssuePage() {
  const { workspaceId, projectId, issueId } = useParams();
  const navigate = useNavigate();

  const [currentIssue, setCurrentIssue] = useState<IssueType | null>(null);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [newStatus, setNewStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>(
    'TODO',
  );

  useEffect(() => {
    async function initialIssue() {
      try {
        setPageError('');

        if (!workspaceId || !projectId || !issueId) {
          setPageError('Issue not found');
          return;
        }

        const issueData = await getIssue(workspaceId, projectId, issueId);

        setCurrentIssue(issueData.issue);
        setNewStatus(issueData.issue.status);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate('/login');
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError('Could not load issue');
        }
      }
    }

    initialIssue();
  }, [workspaceId, projectId, issueId, navigate]);

  async function handleUpdateStatus() {
    setFormError('');

    if (!workspaceId || !projectId || !issueId) {
      setFormError('Issue not found');
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
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not update issue');
      }
    }
  }

  return (
    <div className='w-full max-w-6xl'>
      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError('')} />
      )}

      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError('')} />
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

      <div className='mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-950'>
        <h2 className='mb-2.5 text-xl font-semibold'>Update Status</h2>

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
