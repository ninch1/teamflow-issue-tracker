import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ContextSidebar from '../components/layout/ContextSidebar';
import WorkspaceMembersPanel from '../components/common/WorkspaceMembersPanel';
import { getMembers } from '../api/membersApi';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';
import type { Member } from '../types/memberTypes';

export default function WorkspaceLayout() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);

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

        // For now, don't block the page if members fail.
        // The main page content should still be usable.
        setMembers([]);
      }
    }

    loadMembers();
  }, [workspaceId, navigate]);

  return (
    <div className='flex w-full gap-6'>
      <div className='min-w-0 flex-1'>
        <Outlet />
      </div>

      <ContextSidebar>
        <WorkspaceMembersPanel members={members} />
      </ContextSidebar>
    </div>
  );
}
