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
import SearchInput from '../components/common/SearchInput';
import type {
  Issue,
  IssuePriority,
  IssueStatus,
  IssueType,
  EditIssueInfo,
} from '../types/issueTypes';
import type { Project, EditProjectInfo } from '../types/projectTypes';
import BackLink from '../components/common/BackLink';

type NewIssue = EditIssueInfo;

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateIssueForm, setShowIssueForm] = useState(false);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [newIssueInfo, setNewIssueInfo] = useState<NewIssue>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    type: 'TASK',
  });
  const [editProjectInfo, setEditProjectInfo] = useState<EditProjectInfo>({
    name: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | IssueStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | IssuePriority>(
    'ALL',
  );
  const [typeFilter, setTypeFilter] = useState<'ALL' | IssueType>('ALL');
  const [isIssuesLoading, setIsIssuesLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');

  const hasActiveFilters =
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    searchValue.trim() !== '';

  const issueCountText = hasActiveFilters
    ? `Showing ${issues.length} issue${issues.length === 1 ? '' : 's'}`
    : `${issues.length} total issue${issues.length === 1 ? '' : 's'}`;

  function handleResetFilters() {
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setTypeFilter('ALL');
    setSearchValue('');
    setDebouncedSearchValue('');
  }

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
          debouncedSearchValue,
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
    debouncedSearchValue,
  ]);

  // useEffect for debouncing search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  async function handleCreateIssue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isCreatingIssue) {
      return;
    }

    setFormError('');

    if (!workspaceId || !projectId) {
      setFormError('Project not found');
      return;
    }

    try {
      setIsCreatingIssue(true);

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

      const matchesSearch =
        debouncedSearchValue.trim() === '' ||
        createdIssue.title
          .toLowerCase()
          .includes(debouncedSearchValue.trim().toLowerCase());

      if (matchesStatus && matchesPriority && matchesType && matchesSearch) {
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
    } finally {
      setIsCreatingIssue(false);
    }
  }

  async function handleUpdateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isUpdatingProject) {
      return;
    }

    setFormError('');

    if (!workspaceId || !projectId) {
      setFormError('Project not found');
      return;
    }

    try {
      setIsUpdatingProject(true);

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
    } finally {
      setIsUpdatingProject(false);
    }
  }

  async function handleDeleteProject() {
    if (isDeletingProject) {
      return;
    }

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
      setIsDeletingProject(true);

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
    } finally {
      setIsDeletingProject(false);
    }
  }

  if (isLoading) {
    return <LoadingCard message='Loading project...' />;
  }

  return (
    <div className='w-full max-w-6xl'>
      <BackLink to={`/workspaces/${workspaceId}`}>Back to workspace</BackLink>

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
        isSubmitting={isUpdatingProject}
      />

      <DangerZone
        buttonText='Delete project'
        submittingText='Deleting...'
        isSubmitting={isDeletingProject}
        message='Deleting this project cannot be undone. All issues inside this project will be removed.'
        onDelete={handleDeleteProject}
        fullWidth
      />

      <div className='mt-5'>
        <div className='mb-5 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-medium tracking-[-0.04em] text-slate-950'>
              Issues
            </h2>
            <p className='pr-5 text-sm text-slate-500'>
              Track tasks, bugs, and feature work inside this project.{' '}
              {issueCountText}.
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

            {hasActiveFilters && (
              <button
                type='button'
                onClick={handleResetFilters}
                className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'
              >
                Reset filters
              </button>
            )}

            {!showCreateIssueForm && (
              <PrimaryButton onClick={() => setShowIssueForm(true)}>
                Create issue
              </PrimaryButton>
            )}
          </div>
        </div>

        <SearchInput value={searchValue} onChange={setSearchValue} />

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
                  isSubmitting={isCreatingIssue}
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
                typeFilter === 'ALL' &&
                debouncedSearchValue === ''
                  ? 'No issues yet. Create your first issue to start tracking work.'
                  : 'No issues match your filters.'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
