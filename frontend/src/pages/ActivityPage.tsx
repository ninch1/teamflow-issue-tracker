import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkspaceActivities } from '../api/activityApi';
import ApiError from '../errors/ApiError';
import { clearAuthTokens } from '../utils/authToken';
import type { Activity } from '../types/activityTypes';
import BackLink from '../components/common/BackLink';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';
import LoadingCard from '../components/common/LoadingCard';

const ACTIVITIES_PER_PAGE = 10;

function formatActivityDate(date: string) {
  return new Date(date).toLocaleString();
}

export default function ActivityPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [page, setPage] = useState(1);
  const [pageError, setPageError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        setIsLoading(true);
        setPageError('');

        if (!workspaceId) {
          setPageError('Workspace not found');
          return;
        }

        const data = await getWorkspaceActivities(
          workspaceId,
          ACTIVITIES_PER_PAGE,
          page,
        );

        setActivities(data.activities);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          clearAuthTokens();
          navigate('/login');
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError('Could not load workspace activity');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadActivities();
  }, [workspaceId, page, navigate]);

  const hasNextPage = activities.length === ACTIVITIES_PER_PAGE;
  const hasPreviousPage = page > 1;

  if (isLoading && activities.length === 0) {
    return <LoadingCard message='Loading activity...' />;
  }

  return (
    <div className='w-full max-w-6xl'>
      <BackLink to={`/workspaces/${workspaceId}`}>Back to workspace</BackLink>

      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError('')} />
      )}

      <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div>
          <h1 className='text-2xl font-medium tracking-[-0.04em] text-slate-950'>
            Activity
          </h1>
          <p className='text-sm text-slate-500'>All workspace updates</p>
        </div>

        {isLoading && (
          <p className='mt-4 text-sm text-slate-500'>Loading activity...</p>
        )}

        {!isLoading && !pageError && activities.length === 0 && (
          <EmptyState message='No activity yet.' />
        )}

        {!isLoading && !pageError && activities.length > 0 && (
          <div className='mt-4 space-y-3'>
            {activities.map((activity) => (
              <div
                key={activity.id}
                className='rounded-lg border border-slate-100 bg-slate-50 p-3'
              >
                <p className='break-words text-sm text-slate-700'>
                  {activity.message}
                </p>
                <p className='mt-1 text-xs text-slate-400'>
                  {formatActivityDate(activity.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}

        {(hasPreviousPage || hasNextPage) && (
          <div className='mt-6 flex items-center justify-between border-t border-slate-100 pt-4'>
            <button
              type='button'
              disabled={!hasPreviousPage || isLoading}
              onClick={() => setPage((currentPage) => currentPage - 1)}
              className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Previous
            </button>

            <p className='text-sm text-slate-500'>Page {page}</p>

            <button
              type='button'
              disabled={!hasNextPage || isLoading}
              onClick={() => setPage((currentPage) => currentPage + 1)}
              className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
