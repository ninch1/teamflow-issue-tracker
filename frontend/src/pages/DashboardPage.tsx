import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceCard from '../components/common/WorkspaceCard';
import { getWorkspaces } from '../api/workspaceApi';
import { removeAuthToken } from '../utils/authToken';

const tempInfo = {
  id: 'de2d36fa-cd51-4775-afcf-435975ca5bfb',
  name: 'Postman Test Workspace',
  role: 'OWNER',
};

type WorkspaceData = {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export default function DashboardPage() {
  const [workspaceCardsData, setWorkspaceCards] = useState<WorkspaceData[]>([]);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    async function getWorkspacesWrapper() {
      try {
        const workspacesData = await getWorkspaces();
        const workspacesArr = workspacesData.workspaces;
        setWorkspaceCards(workspacesArr);
      } catch (error: unknown) {
        if (error instanceof Error) {
          removeAuthToken();
          setError(error.message);
        } else {
          removeAuthToken();
          setError('Could not connect to server');
        }

        navigate('/login');
      }
    }

    getWorkspacesWrapper();
  }, [navigate]);

  return (
    <div>
      <h1 className='mb-10 text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
        Dashboard
      </h1>
      <h2 className='mb-5 text-2xl tracking-[-0.04em] text-slate-950'>
        Your Workspaces
      </h2>
      <main>
        {error && (
          <p className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
            {error}
          </p>
        )}

        {!error && workspaceCardsData.length > 0 && (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {workspaceCardsData.map((data) => (
              <WorkspaceCard key={data.id} workspaceInfo={data} />
            ))}
          </div>
        )}

        {!error && workspaceCardsData.length === 0 && (
          <p className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600'>
            No workspaces yet.
          </p>
        )}
      </main>
    </div>
  );
}
