import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject } from '../api/projectApi';
import { getIssues, createIssue } from '../api/issueApi';
import IssueCard from '../components/common/IssueCard';
import CreateIssueCard from '../components/layout/CreateIssueCard';
import ErrorAlert from '../components/common/ErrorAlert';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';

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

  useEffect(() => {
    async function initialProject() {
      try {
        setPageError('');

        if (!workspaceId || !projectId) {
          setPageError('Project not found');
          return;
        }

        const projectData = await getProject(workspaceId, projectId);
        const issuesData = await getIssues(workspaceId, projectId);

        setCurrentProject(projectData.project);
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
          setPageError('Could not load project');
        }
      }
    }

    initialProject();
  }, [workspaceId, projectId, navigate]);

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

      setIssues((prev) => [...prev, newIssueData.issue]);
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

  return (
    <div className='w-full max-w-6xl'>
      {pageError && (
        <ErrorAlert message={pageError} onClose={() => setPageError('')} />
      )}

      {formError && (
        <ErrorAlert message={formError} onClose={() => setFormError('')} />
      )}

      <div className='mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
        <div>
          <p className='mb-2 text-sm text-slate-500'>Project</p>

          <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
            {currentProject?.name}
          </h1>

          <p className='mt-2 text-sm text-slate-500'>
            {currentProject?.description || 'No description yet.'}
          </p>
        </div>
      </div>

      <div>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-medium tracking-[-0.04em] text-slate-950'>
              Issues
            </h2>
            <p className='pr-5 text-sm text-slate-500'>
              Track tasks, bugs, and feature work inside this project.
            </p>
          </div>

          {!showCreateIssueForm && (
            <button
              onClick={() => setShowIssueForm(true)}
              className='rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] hover:cursor-pointer'
            >
              Create issue
            </button>
          )}
        </div>

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
            No issues yet. Create your first issue to start tracking work.
          </div>
        )}
      </div>
    </div>
  );
}
