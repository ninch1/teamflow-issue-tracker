import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ContextSidebar from '../components/layout/ContextSidebar';
import WorkspaceMembersPanel from '../components/common/WorkspaceMembersPanel';
import MobileDrawer from '../components/layout/MobileDrawer';
import { getMembers } from '../api/membersApi';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';
import type { Member } from '../types/memberTypes';

export default function WorkspaceLayout() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      if (!workspaceId) {
        return;
      }

      try {
        const membersData = await getMembers(workspaceId);
        setMembers(membersData.members);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate('/login');
          return;
        }

        setMembers([]);
      }
    }

    loadMembers();
  }, [workspaceId, navigate]);

  return (
    <>
      <div className='flex w-full gap-6'>
        <div className='min-w-0 flex-1'>
          <div className='flex justify-end xl:hidden'>
            <button
              type='button'
              onClick={() => setIsMembersDrawerOpen(true)}
              className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'
            >
              View members
            </button>
          </div>

          <Outlet />
        </div>

        <ContextSidebar>
          <WorkspaceMembersPanel members={members} />
        </ContextSidebar>
      </div>

      <MobileDrawer
        isOpen={isMembersDrawerOpen}
        title='Workspace members'
        onClose={() => setIsMembersDrawerOpen(false)}
      >
        <WorkspaceMembersPanel members={members} />
      </MobileDrawer>
    </>
  );
}
