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
import BackLink from '../components/common/BackLink';
import SuccessAlert from '../components/common/SuccessAlert';
import EmptyState from '../components/common/EmptyState';

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
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isUpdatingWorkspace, setIsUpdatingWorkspace] = useState(false);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

    if (isCreatingProject) {
      return;
    }

    setFormError('');
    setSuccessMessage('');

    if (!newProjectInfo.name.trim()) {
      setFormError('Project name is required');
      return;
    }

    if (!workspaceId) {
      setFormError('Workspace not found');
      return;
    }

    try {
      setIsCreatingProject(true);

      const newProjectData = await createProject(
        workspaceId,
        newProjectInfo.name,
        newProjectInfo.description,
      );

      setNewProjectInfo({ name: '', description: '' });
      setShowCreateProjectForm(false);

      setCurrentProjects((prev) => [...prev, newProjectData.project]);

      setSuccessMessage('Project created successfully.');
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
    } finally {
      setIsCreatingProject(false);
    }
  }

  async function handleUpdateWorkspace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isUpdatingWorkspace) {
      return;
    }

    setFormError('');
    setSuccessMessage('');

    if (!editWorkspaceInfo.name.trim()) {
      setFormError('Workspace name is required');
      return;
    }

    if (!workspaceId) {
      setFormError('Workspace not found');
      return;
    }

    try {
      setIsUpdatingWorkspace(true);

      const updatedWorkspaceData = await updateWorkspace(workspaceId, {
        name: editWorkspaceInfo.name,
        description: editWorkspaceInfo.description,
      });

      setCurrentWorkspace(updatedWorkspaceData.workspace);

      setEditWorkspaceInfo({
        name: updatedWorkspaceData.workspace.name,
        description: updatedWorkspaceData.workspace.description || '',
      });
      setSuccessMessage('Workspace saved successfully.');
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
    } finally {
      setIsUpdatingWorkspace(false);
    }
  }

  async function handleDeleteWorkspace() {
    if (isDeletingWorkspace) {
      return;
    }

    setFormError('');
    setSuccessMessage('');

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
      setIsDeletingWorkspace(true);

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
    } finally {
      setIsDeletingWorkspace(false);
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
    return <LoadingCard message='Loading workspace...' />;
  }

  return (
    <div className='w-full'>
      <BackLink to='/dashboard'>Back to dashboard</BackLink>

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

      {currentWorkspace && (
        <WorkspaceDetailsCard workspace={currentWorkspace} />
      )}

      <WorkspaceEditForm
        editWorkspaceInfo={editWorkspaceInfo}
        onEditWorkspaceChange={setEditWorkspaceInfo}
        onSubmit={handleUpdateWorkspace}
        isSubmitting={isUpdatingWorkspace}
      />

      <DangerZone
        buttonText='Delete workspace'
        submittingText='Deleting...'
        isSubmitting={isDeletingWorkspace}
        message='Deleting this workspace cannot be undone. All projects and issues inside this workspace will be removed.'
        onDelete={handleDeleteWorkspace}
        fullWidth
      />

      <main className='mt-5'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
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
              isSubmitting={isCreatingProject}
            />
          )}

          {currentProjects.map((project) => (
            <ProjectCard key={project.id} projectInfo={project} />
          ))}
        </div>

        {!showCreateProjectForm && currentProjects.length === 0 && (
          <EmptyState message='No projects yet. Create your first project to start tracking work.' />
        )}
      </main>
    </div>
  );
}
