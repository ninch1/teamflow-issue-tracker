import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceCard from '../components/common/WorkspaceCard';
import { getWorkspaces, createWorkspace } from '../api/workspaceApi';
import AddWorkspaceCard from '../components/layout/AddWorkspaceCard';
import CreateWorkspaceCard from '../components/layout/CreateWorkspaceCard';
import ErrorAlert from '../components/common/ErrorAlert';

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
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceInfo, setNewWorkspaceInfo] = useState<NewWorkspace>({
    name: '',
    description: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    async function getWorkspacesWrapper() {
      try {
        const workspacesData = await getWorkspaces();
        const workspacesArr = workspacesData.workspaces;
        setWorkspaceCardsData(workspacesArr);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Could not connect to server');
        }

        navigate('/login');
      }
    }

    getWorkspacesWrapper();
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Could not connect to server');
      }
    }
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
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        {workspaceCardsData.length > 0 && (
          <div className='pt-2.5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
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
                  setError('');
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
