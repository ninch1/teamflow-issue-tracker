import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkspace } from '../api/workspaceApi';
import { getProjects, createProject } from '../api/projectApi';
import ProjectCard from '../components/common/ProjectCard';
import CreateProjectCard from '../components/layout/CreateProjectCard';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';

type WorkspaceType = {
  id: string;
  name: string;
  description: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
};

type ProjectType = {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

type NewProject = {
  name: string;
  description: string;
};

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [currentWorkspace, setCurrentWorkspace] =
    useState<WorkspaceType | null>(null);
  const [currentProjects, setCurrentProjects] = useState<ProjectType[]>([]);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [newProjectInfo, setNewProjectInfo] = useState<NewProject>({
    name: '',
    description: '',
  });

  useEffect(() => {
    async function initialWorkspace() {
      try {
        setPageError('');

        if (!workspaceId) {
          setPageError('Workspace not found');
          return;
        }

        const workspaceData = await getWorkspace(workspaceId);
        const projectsData = await getProjects(workspaceId);

        setCurrentWorkspace(workspaceData.workspace);
        setCurrentProjects(projectsData.projects);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate('/login');
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError('Could not load workspace');
        }
      }
    }

    initialWorkspace();
  }, [workspaceId, navigate]);

  async function handleCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    if (!workspaceId) {
      setFormError('Workspace not found');
      return;
    }

    try {
      const newProjectData = await createProject(
        workspaceId,
        newProjectInfo.name,
        newProjectInfo.description,
      );

      setNewProjectInfo({ name: '', description: '' });
      setShowCreateProjectForm(false);

      setCurrentProjects((prev) => [...prev, newProjectData.project]);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not create project');
      }
    }
  }

  return (
    <div className='w-full max-w-6xl'>
      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError('')} />
      )}

      <div className='mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='mb-2 text-sm text-slate-500'>Workspace</p>

            <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
              {currentWorkspace?.name}
            </h1>

            <p className='mt-2 text-sm text-slate-500'>
              {currentWorkspace?.description || 'No description yet.'}
            </p>
          </div>

          <span className='rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'>
            {currentWorkspace?.role}
          </span>
        </div>
      </div>

      <div>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-medium tracking-[-0.04em] text-slate-950'>
              Projects
            </h2>
            <p className='text-sm text-slate-500'>
              Track projects inside this workspace.
            </p>
          </div>

          {!showCreateProjectForm && (
            <button
              onClick={() => setShowCreateProjectForm(true)}
              className='rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] hover:cursor-pointer'
            >
              Create project
            </button>
          )}
        </div>

        {formError && (
          <ErrorAlert message={formError} onClose={() => setFormError('')} />
        )}

        <div className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {showCreateProjectForm && (
            <CreateProjectCard
              name={newProjectInfo.name}
              description={newProjectInfo.description}
              onNameChange={(value) =>
                setNewProjectInfo((prev) => ({ ...prev, name: value }))
              }
              onDescriptionChange={(value) =>
                setNewProjectInfo((prev) => ({ ...prev, description: value }))
              }
              onSubmit={handleCreateProject}
              onCancel={() => {
                setNewProjectInfo({ name: '', description: '' });
                setFormError('');
                setShowCreateProjectForm(false);
              }}
            />
          )}

          {currentProjects.map((project) => (
            <ProjectCard key={project.id} projectInfo={project} />
          ))}
        </div>

        {!showCreateProjectForm && currentProjects.length === 0 && (
          <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500'>
            No projects yet. Create your first project to start tracking work.
          </div>
        )}
      </div>
    </div>
  );
}
