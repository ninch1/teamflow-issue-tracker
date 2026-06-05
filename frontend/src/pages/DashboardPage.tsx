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

type WorkspaceData = {
  id: string;
  name: string;
  description: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type NewWorkspace = {
  name: string;
  description: string;
};

export default function DashboardPage() {
  const [workspaceCardsData, setWorkspaceCardsData] = useState<WorkspaceData[]>(
    [],
  );
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceInfo, setNewWorkspaceInfo] = useState<NewWorkspace>({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);

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
    setFormError('');

    try {
      const newWorkspace = await createWorkspace(
        newWorkspaceInfo.name,
        newWorkspaceInfo.description,
      );

      setWorkspaceCardsData((prev) => {
        return [...prev, newWorkspace.workspace];
      });

      setNewWorkspaceInfo({ name: '', description: '' });
      setShowCreateForm(false);
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
    }
  }

  if (isLoading) {
    return <LoadingCard message='Loading dashboard...' />;
  }

  return (
    <div className='w-full max-w-6xl'>
      <h1 className='mb-10 text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
        Dashboard
      </h1>

      <h2 className='mb-5 text-2xl tracking-[-0.04em] text-slate-950'>
        Your Workspaces
      </h2>

      <main>
        {pageError && (
          <ErrorAlert message={pageError} onClose={() => setPageError('')} />
        )}

        {formError && (
          <ErrorAlert message={formError} onClose={() => setFormError('')} />
        )}

        {workspaceCardsData.length > 0 && (
          <div className='grid gap-4 pt-2.5 sm:grid-cols-2 lg:grid-cols-3'>
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
              />
            ) : (
              <AddWorkspaceCard onClick={() => setShowCreateForm(true)} />
            )}

            {workspaceCardsData.map((data) => (
              <WorkspaceCard key={data.id} workspaceInfo={data} />
            ))}
          </div>
        )}

        {workspaceCardsData.length === 0 && (
          <p className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600'>
            No workspaces yet.
          </p>
        )}
      </main>
    </div>
  );
}
