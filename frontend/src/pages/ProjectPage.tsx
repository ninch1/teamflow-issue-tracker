import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject, updateProject, deleteProject } from '../api/projectApi';
import { getIssues, createIssue } from '../api/issueApi';
import IssueCard from '../components/common/IssueCard';
import CreateIssueCard from '../components/layout/CreateIssueCard';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';
import PrimaryButton from '../components/common/PrimaryButton';
import ProjectDetailsCard from '../components/layout/ProjectDetailsCard';
import ProjectEditForm from '../components/layout/ProjectEditForm';
import DangerZone from '../components/common/DangerZone';
import LoadingCard from '../components/common/LoadingCard';

type ProjectType = {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

type IssueType = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

type NewIssue = {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'BUG' | 'FEATURE' | 'TASK';
};

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [currentProject, setCurrentProject] = useState<ProjectType | null>(
    null,
  );
  const [issues, setIssues] = useState<IssueType[]>([]);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateIssueForm, setShowIssueForm] = useState(false);
  const [newIssueInfo, setNewIssueInfo] = useState<NewIssue>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    type: 'TASK',
  });
  const [editProjectInfo, setEditProjectInfo] = useState({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'
  >('ALL');
  const [priorityFilter, setPriorityFilter] = useState<
    'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'
  >('ALL');
  const [typeFilter, setTypeFilter] = useState<
    'ALL' | 'BUG' | 'FEATURE' | 'TASK'
  >('ALL');
  const [isIssuesLoading, setIsIssuesLoading] = useState(false);

  useEffect(() => {
    async function initialProject() {
      try {
        setIsLoading(true);
        setPageError('');

        if (!workspaceId || !projectId) {
          setPageError('Project not found');
          return;
        }

        const projectData = await getProject(workspaceId, projectId);

        setCurrentProject(projectData.project);
        setEditProjectInfo({
          name: projectData.project.name,
          description: projectData.project.description || '',
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
          setPageError('Could not load project');
        }
      } finally {
        setIsLoading(false);
      }
    }

    initialProject();
  }, [workspaceId, projectId, navigate]);

  useEffect(() => {
    async function loadIssues() {
      try {
        setIsIssuesLoading(true);
        setPageError('');

        if (!workspaceId || !projectId) {
          setPageError('Project not found');
          return;
        }

        const issuesData = await getIssues(
          workspaceId,
          projectId,
          statusFilter === 'ALL' ? undefined : statusFilter,
          priorityFilter === 'ALL' ? undefined : priorityFilter,
          typeFilter === 'ALL' ? undefined : typeFilter,
        );

        setIssues(issuesData.issues);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate('/login');
          return;
        }

        if (error instanceof Error) {
          setPageError(error.message);
        } else {
          setPageError('Could not load issues');
        }
      } finally {
        setIsIssuesLoading(false);
      }
    }

    loadIssues();
  }, [
    workspaceId,
    projectId,
    navigate,
    statusFilter,
    priorityFilter,
    typeFilter,
  ]);

  async function handleCreateIssue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    if (!workspaceId || !projectId) {
      setFormError('Project not found');
      return;
    }

    try {
      const newIssueData = await createIssue(
        workspaceId,
        projectId,
        newIssueInfo.title,
        newIssueInfo.description,
        newIssueInfo.priority,
        newIssueInfo.type,
      );

      setNewIssueInfo({
        title: '',
        description: '',
        priority: 'MEDIUM',
        type: 'TASK',
      });
      setShowIssueForm(false);

      const createdIssue = newIssueData.issue;

      const matchesStatus =
        statusFilter === 'ALL' || createdIssue.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'ALL' || createdIssue.priority === priorityFilter;

      const matchesType =
        typeFilter === 'ALL' || createdIssue.type === typeFilter;

      if (matchesStatus && matchesPriority && matchesType) {
        setIssues((prev) => [...prev, createdIssue]);
      }
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not create issue');
      }
    }
  }

  async function handleUpdateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');

    if (!workspaceId || !projectId) {
      setFormError('Project not found');
      return;
    }

    try {
      const updatedProjectData = await updateProject(workspaceId, projectId, {
        name: editProjectInfo.name,
        description: editProjectInfo.description,
      });

      setCurrentProject(updatedProjectData.project);

      setEditProjectInfo({
        name: updatedProjectData.project.name,
        description: updatedProjectData.project.description || '',
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
        setFormError('Could not update project');
      }
    }
  }

  async function handleDeleteProject() {
    setFormError('');

    if (!workspaceId || !projectId) {
      setFormError('Project not found');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this project? This will also remove its issues.',
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(workspaceId, projectId);

      navigate(`/workspaces/${workspaceId}`);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate('/login');
        return;
      }

      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('Could not delete project');
      }
    }
  }

  if (isLoading) {
    return <LoadingCard message='Loading project...' />;
  }

  return (
    <div className='w-full max-w-6xl'>
      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError('')} />
      )}

      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError('')} />
      )}

      {currentProject && <ProjectDetailsCard project={currentProject} />}

      <ProjectEditForm
        editProjectInfo={editProjectInfo}
        onEditProjectChange={setEditProjectInfo}
        onSubmit={handleUpdateProject}
      />

      <DangerZone
        buttonText='Delete project'
        message='Deleting this project cannot be undone. All issues inside this project will be removed.'
        onDelete={handleDeleteProject}
        fullWidth
      />

      <div className='mt-5'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-medium tracking-[-0.04em] text-slate-950'>
              Issues
            </h2>
            <p className='pr-5 text-sm text-slate-500'>
              Track tasks, bugs, and feature work inside this project.
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE',
                )
              }
              className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
            >
              <option value='ALL'>All statuses</option>
              <option value='TODO'>Todo</option>
              <option value='IN_PROGRESS'>In Progress</option>
              <option value='DONE'>Done</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value as 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH',
                )
              }
              className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
            >
              <option value='ALL'>All priorities</option>
              <option value='LOW'>Low</option>
              <option value='MEDIUM'>Medium</option>
              <option value='HIGH'>High</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as 'ALL' | 'BUG' | 'FEATURE' | 'TASK',
                )
              }
              className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
            >
              <option value='ALL'>All types</option>
              <option value='BUG'>Bug</option>
              <option value='FEATURE'>Feature</option>
              <option value='TASK'>Task</option>
            </select>

            {!showCreateIssueForm && (
              <PrimaryButton onClick={() => setShowIssueForm(true)}>
                Create issue
              </PrimaryButton>
            )}
          </div>
        </div>

        {isIssuesLoading ? (
          <div className='mt-5'>
            <LoadingCard message='Loading issues...' />
          </div>
        ) : (
          <>
            <div className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {showCreateIssueForm && (
                <CreateIssueCard
                  title={newIssueInfo.title}
                  description={newIssueInfo.description}
                  priority={newIssueInfo.priority}
                  type={newIssueInfo.type}
                  onTitleChange={(value) =>
                    setNewIssueInfo((prev) => ({ ...prev, title: value }))
                  }
                  onDescriptionChange={(value) =>
                    setNewIssueInfo((prev) => ({ ...prev, description: value }))
                  }
                  onPriorityChange={(value) =>
                    setNewIssueInfo((prev) => ({ ...prev, priority: value }))
                  }
                  onTypeChange={(value) =>
                    setNewIssueInfo((prev) => ({ ...prev, type: value }))
                  }
                  onSubmit={handleCreateIssue}
                  onCancel={() => {
                    setNewIssueInfo({
                      title: '',
                      description: '',
                      priority: 'MEDIUM',
                      type: 'TASK',
                    });
                    setFormError('');
                    setShowIssueForm(false);
                  }}
                />
              )}

              {currentProject &&
                issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    workspaceId={currentProject.workspaceId}
                    issueInfo={issue}
                  />
                ))}
            </div>

            {!showCreateIssueForm && issues.length === 0 && (
              <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500'>
                {statusFilter === 'ALL' &&
                priorityFilter === 'ALL' &&
                typeFilter === 'ALL'
                  ? 'No issues yet. Create your first issue to start tracking work.'
                  : 'No issues found for this filter.'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
