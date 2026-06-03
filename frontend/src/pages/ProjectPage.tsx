import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProject } from '../api/projectApi';
import { getIssues } from '../api/issueApi';
import IssueCard from '../components/common/IssueCard';

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

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams();

  const [currentProject, setCurrentProject] = useState<ProjectType | null>(
    null,
  );
  const [issues, setIssues] = useState<IssueType[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function initialProject() {
      try {
        setError('');

        if (!workspaceId || !projectId) {
          throw new Error('Project not found');
        }

        const projectData = await getProject(workspaceId, projectId);
        const issuesData = await getIssues(workspaceId, projectId);

        setCurrentProject(projectData.project);
        setIssues(issuesData.issues);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Could not load project');
        }
      }
    }

    initialProject();
  }, [workspaceId, projectId]);

  return (
    <div className='w-full max-w-6xl'>
      {error && (
        <div className='mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
          <p>{error}</p>

          <button
            type='button'
            onClick={() => setError('')}
            className='cursor-pointer rounded px-2 text-red-500 hover:bg-red-100 hover:text-red-700'
          >
            X
          </button>
        </div>
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

          <button className='rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] hover:cursor-pointer'>
            Create issue
          </button>
        </div>

        <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500'>
          {issues.length === 0 ? (
            <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500'>
              No issues yet. Create your first issue to start tracking work.
            </div>
          ) : (
            <div className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {currentProject &&
                issues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    workspaceId={currentProject.workspaceId}
                    issueInfo={issue}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
