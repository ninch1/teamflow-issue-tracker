import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ContextSidebar from '../components/layout/ContextSidebar';
import WorkspaceMembersPanel from '../components/common/WorkspaceMembersPanel';
import MobileDrawer from '../components/layout/MobileDrawer';
import { getMembers } from '../api/membersApi';
import { getMe } from '../api/authApi';
import ApiError from '../errors/ApiError';
import { removeAuthToken } from '../utils/authToken';
import type { Member } from '../types/memberTypes';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import MemberInfoModal from '../components/common/MemberInfoModal';

export default function WorkspaceLayout() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);
  const [showMemberInfo, setShowMemberInfo] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  useEffect(() => {
    async function loadWorkspaceLayoutData() {
      if (!workspaceId) {
        return;
      }

      try {
        const meData = await getMe();
        const membersData = await getMembers(workspaceId);

        setCurrentUserId(meData.user.id);
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

    loadWorkspaceLayoutData();
  }, [workspaceId, navigate]);

  const currentMember = members.find(
    (member) => member.user.id === currentUserId,
  );

  const currentUserRole = currentMember?.role ?? null;

  const canManageWorkspace =
    currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  function handleMemberClick(memberId: string) {
    if (!memberId) {
      return;
    }

    setSelectedMemberId(memberId);
    setShowMemberInfo(true);
  }

  const selectedMember = members.find(
    (member) => member.id === selectedMemberId,
  );

  function handleCloseMemberInfo() {
    setShowMemberInfo(false);
    setSelectedMemberId('');
  }

  return (
    <WorkspaceProvider
      value={{
        members,
        currentUserRole,
        canManageWorkspace,
      }}
    >
      {showMemberInfo && selectedMember && (
        <MemberInfoModal
          member={selectedMember}
          onClose={handleCloseMemberInfo}
        />
      )}
      <div className='flex w-full gap-6'>
        <div className='min-w-0 flex-1'>
          <div className='mb-5 flex justify-end xl:hidden'>
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
          {workspaceId && (
            <WorkspaceMembersPanel
              workspaceId={workspaceId}
              members={members}
              handleMemberClick={handleMemberClick}
            />
          )}
        </ContextSidebar>
      </div>

      <MobileDrawer
        isOpen={isMembersDrawerOpen}
        title='Workspace members'
        onClose={() => setIsMembersDrawerOpen(false)}
      >
        {workspaceId && (
          <WorkspaceMembersPanel
            workspaceId={workspaceId}
            members={members}
            handleMemberClick={handleMemberClick}
          />
        )}
      </MobileDrawer>
    </WorkspaceProvider>
  );
}
