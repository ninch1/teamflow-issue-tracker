import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getWorkspace,
  deleteWorkspace,
  updateWorkspace,
} from '../api/workspaceApi';
import { getProjects, createProject } from '../api/projectApi';
import ProjectCard from '../components/common/ProjectCard';
import CreateProjectCard from '../components/layout/CreateProjectCard';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';
import PrimaryButton from '../components/common/PrimaryButton';
import WorkspaceDetailsCard from '../components/layout/WorkspaceDetailsCard';
import WorkspaceEditForm from '../components/layout/WorkspaceEditForm';
import DangerZone from '../components/common/DangerZone';
import LoadingCard from '../components/common/LoadingCard';
import type { Project } from '../types/projectTypes';
import type { Workspace, EditWorkspaceInfo } from '../types/workspaceTypes';

type NewProject = {
  name: string;
  description: string;
};

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null,
  );
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [newProjectInfo, setNewProjectInfo] = useState<NewProject>({
    name: '',
    description: '',
  });
  const [editWorkspaceInfo, setEditWorkspaceInfo] = useState<EditWorkspaceInfo>(
    {
      name: '',
      description: '',
    },
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initialWorkspace() {
      try {
        setIsLoading(true);
        setPageError('');

        if (!workspaceId) {
          setPageError('Workspace not found');
          return;
        }

        const workspaceData = await getWorkspace(workspaceId);
        const projectsData = await getProjects(workspaceId);

        setCurrentWorkspace(workspaceData.workspace);
        setCurrentProjects(projectsData.projects);
        setEditWorkspaceInfo({
          name: workspaceData.workspace.name,
          description: workspaceData.workspace.description || '',
        });
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
      } finally {
        setIsLoading(false);
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

  async function handleUpdateWorkspace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    if (!workspaceId) {
      setFormError('Workspace not found');
      return;
    }

    try {
      const updatedWorkspaceData = await updateWorkspace(workspaceId, {
        name: editWorkspaceInfo.name,
        description: editWorkspaceInfo.description,
      });

      setCurrentWorkspace(updatedWorkspaceData.workspace);

      setEditWorkspaceInfo({
        name: updatedWorkspaceData.workspace.name,
        description: updatedWorkspaceData.workspace.description || '',
      });
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not update workspace');
      }
    }
  }

  async function handleDeleteWorkspace() {
    setFormError('');

    if (!workspaceId) {
      setFormError('Workspace not found');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this workspace? This will also remove its projects and issues.',
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWorkspace(workspaceId);

      navigate('/dashboard');
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not delete workspace');
      }
    }
  }

  if (isLoading) {
    return <LoadingCard message='Loading workspace...' />;
  }

  return (
    <div className='w-full max-w-6xl'>
      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError('')} />
      )}

      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError('')} />
      )}

      {currentWorkspace && (
        <WorkspaceDetailsCard workspace={currentWorkspace} />
      )}

      <WorkspaceEditForm
        editWorkspaceInfo={editWorkspaceInfo}
        onEditWorkspaceChange={setEditWorkspaceInfo}
        onSubmit={handleUpdateWorkspace}
      />

      <DangerZone
        buttonText='Delete workspace'
        message='Deleting this workspace cannot be undone. All projects and issues inside this workspace will be removed.'
        onDelete={handleDeleteWorkspace}
        fullWidth
      />

      <div className='mt-5'>
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
            <PrimaryButton onClick={() => setShowCreateProjectForm(true)}>
              Create project
            </PrimaryButton>
          )}
        </div>

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
