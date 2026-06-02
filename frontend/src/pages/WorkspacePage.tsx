import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getWorkspace } from '../api/workspaceApi';

type WorkspaceType = {
  id: string;
  name: string;
  description: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
};

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const [currentWorkspace, setCurrentWorkspace] =
    useState<WorkspaceType | null>(null);

  useEffect(() => {
    async function initialWorkspace() {
      try {
        if (!workspaceId) {
          throw new Error('Please choose workspace');
        }
        const workspaceData = await getWorkspace(workspaceId);

        setCurrentWorkspace(workspaceData.workspace);
      } catch (error: unknown) {
        console.log(error);
      }
    }

    initialWorkspace();
  }, [workspaceId]);

  return (
    <div className='w-full'>
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

          <button className='rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff]'>
            Create project
          </button>
        </div>
        <div className='mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500'>
          No projects yet. Create your first project to start tracking work.
        </div>
      </div>
    </div>
  );
}
