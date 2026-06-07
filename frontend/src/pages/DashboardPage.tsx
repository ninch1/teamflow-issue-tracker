import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceCard from '../components/common/WorkspaceCard';
import { getWorkspaces, createWorkspace } from '../api/workspaceApi';
import AddWorkspaceCard from '../components/layout/AddWorkspaceCard';
import CreateWorkspaceCard from '../components/layout/CreateWorkspaceCard';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';
import LoadingCard from '../components/common/LoadingCard';
import type { Workspace } from '../types/workspaceTypes';
import SuccessAlert from '../components/common/SuccessAlert';
import EmptyState from '../components/common/EmptyState';

type NewWorkspace = {
  name: string;
  description: string;
};

export default function DashboardPage() {
  const [workspaceCardsData, setWorkspaceCardsData] = useState<Workspace[]>([]);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceInfo, setNewWorkspaceInfo] = useState<NewWorkspace>({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    async function getWorkspacesWrapper() {
      try {
        setIsLoading(true);
        setPageError('');

        const workspacesData = await getWorkspaces();
        const workspacesArr = workspacesData.workspaces;

        setWorkspaceCardsData(workspacesArr);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate('/login');
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError('Could not load workspaces');
        }
      } finally {
        setIsLoading(false);
      }
    }

    getWorkspacesWrapper();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isCreatingWorkspace) {
      return;
    }

    setFormError('');
    setSuccessMessage('');

    if (!newWorkspaceInfo.name.trim()) {
      setFormError('Workspace name is required');
      return;
    }

    try {
      setIsCreatingWorkspace(true);

      const newWorkspace = await createWorkspace(
        newWorkspaceInfo.name,
        newWorkspaceInfo.description,
      );

      setWorkspaceCardsData((prev) => [...prev, newWorkspace.workspace]);

      setNewWorkspaceInfo({ name: '', description: '' });
      setShowCreateForm(false);
      setSuccessMessage('Workspace created successfully.');
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not create workspace');
      }
    } finally {
      setIsCreatingWorkspace(false);
    }
  }

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  if (isLoading) {
    return <LoadingCard message='Loading dashboard...' />;
  }

  return (
    <div className='w-full max-w-6xl'>
      <div className='rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <p className='mb-2 text-sm text-slate-500'>Dashboard</p>

        <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
          Your workspaces
        </h1>

        <p className='mt-2 text-sm text-slate-500'>
          Manage your workspaces, projects, and issues from one place.
        </p>
      </div>

      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError('')} />
      )}

      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError('')} />
      )}

      {successMessage && (
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
      )}

      <main className='mt-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-medium tracking-[-0.04em] text-slate-950'>
              Workspaces
            </h2>

            <p className='text-sm text-slate-500'>
              Choose a workspace or create a new one.
            </p>
          </div>
        </div>

        <div className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {showCreateForm ? (
            <CreateWorkspaceCard
              name={newWorkspaceInfo.name}
              description={newWorkspaceInfo.description}
              onNameChange={(value) =>
                setNewWorkspaceInfo((prev) => ({ ...prev, name: value }))
              }
              onDescriptionChange={(value) =>
                setNewWorkspaceInfo((prev) => ({
                  ...prev,
                  description: value,
                }))
              }
              onSubmit={handleSubmit}
              onCancel={() => {
                setNewWorkspaceInfo({ name: '', description: '' });
                setShowCreateForm(false);
                setFormError('');
              }}
              isSubmitting={isCreatingWorkspace}
            />
          ) : (
            <AddWorkspaceCard onClick={() => setShowCreateForm(true)} />
          )}

          {workspaceCardsData.map((data) => (
            <WorkspaceCard key={data.id} workspaceInfo={data} />
          ))}
        </div>

        {workspaceCardsData.length === 0 && !showCreateForm && (
          <EmptyState message=' No workspaces yet. Create your first workspace to get started.' />
        )}
      </main>
    </div>
  );
}
