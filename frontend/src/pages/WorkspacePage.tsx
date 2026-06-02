import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWorkspace } from '../api/workspaceApi';
import { getProjects, createProject } from '../api/projectApi';
import ProjectCard from '../components/common/ProjectCard';
import CreateProjectCard from '../components/layout/CreateProjectCard';

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

  const [currentWorkspace, setCurrentWorkspace] =
    useState<WorkspaceType | null>(null);
  const [currentProjects, setCurrentProjects] = useState<ProjectType[]>([]);
  const [showCreateProjectForm, setShowCreateProjectForm] = useState(false);
  const [newProjectInfo, setNewProjectInfo] = useState<NewProject>({
    name: '',
    description: '',
  });
  const [projectError, setProjectError] = useState('');

  useEffect(() => {
    async function initialWorkspace() {
      try {
        if (!workspaceId) {
          throw new Error('Please choose workspace');
        }
        const workspaceData = await getWorkspace(workspaceId);
        const projectsData = await getProjects(workspaceId);

        setCurrentWorkspace(workspaceData.workspace);
        setCurrentProjects(projectsData.projects);
      } catch (error: unknown) {
        console.log(error);
      }
    }

    initialWorkspace();
  }, [workspaceId]);

  async function handleCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProjectError('');

    if (!workspaceId) {
      setProjectError('Workspace not found');
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
      if (error instanceof Error) {
        setProjectError(error.message);
      } else {
        setProjectError('Could not create project');
      }
    }
  }

  return (
    <div className='w-full max-w-6xl'>
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

        {projectError && (
          <div className='mt-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
            <p>{projectError}</p>

            <button
              type='button'
              onClick={() => setProjectError('')}
              className='cursor-pointer rounded px-2 text-red-500 hover:bg-red-100 hover:text-red-700'
            >
              X
            </button>
          </div>
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
                setProjectError('');
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
