import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ContextSidebar from "../components/layout/ContextSidebar";
import WorkspaceMembersPanel from "../components/common/WorkspaceMembersPanel";
import MobileDrawer from "../components/layout/MobileDrawer";
import { getMembers } from "../api/membersApi";
import { getMe } from "../api/authApi";
import ApiError from "../errors/ApiError";
import { removeAuthToken } from "../utils/authToken";
import type { Member } from "../types/memberTypes";
import { WorkspaceProvider } from "../context/WorkspaceContext";
import MemberInfoModal from "../components/common/MemberInfoModal";
import { removeMember, updateMemberRole } from "../api/membersApi";
import { getWorkspaceActivities } from "../api/activityApi";
import type { Activity } from "../types/activityTypes";
import ActivityPanel from "../components/activity/ActivityPanel";

export default function WorkspaceLayout() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);
  const [showMemberInfo, setShowMemberInfo] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [removeMemberError, setRemoveMemberError] = useState("");
  const [isUpdatingMemberRole, setIsUpdatingMemberRole] = useState(false);
  const [updateMemberRoleError, setUpdateMemberRoleError] = useState("");
  const [memberActionSuccess, setMemberActionSuccess] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesError, setActivitiesError] = useState("");
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  useEffect(() => {
    if (!memberActionSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMemberActionSuccess("");
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [memberActionSuccess]);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    const activeWorkspaceId = workspaceId;

    async function loadWorkspaceData() {
      try {
        const [membersData, currentUserData] = await Promise.all([
          getMembers(activeWorkspaceId),
          getMe(),
        ]);

        setMembers(membersData.members);
        setCurrentUserId(currentUserData.user.id);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate("/login");
          return;
        }

        console.error("Failed to load workspace data:", error);
      }
    }

    loadWorkspaceData();
  }, [workspaceId, navigate]);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    const activeWorkspaceId = workspaceId;

    async function loadActivities() {
      try {
        setIsLoadingActivities(true);
        setActivitiesError("");

        const data = await getWorkspaceActivities(activeWorkspaceId);
        setActivities(data.activities);
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          removeAuthToken();
          navigate("/login");
          return;
        }

        if (error instanceof Error) {
          setActivitiesError(error.message);
        } else {
          setActivitiesError("Could not load workspace activity");
        }
      } finally {
        setIsLoadingActivities(false);
      }
    }

    loadActivities();
  }, [workspaceId, navigate]);

  const currentMember = members.find(
    (member) => member.user.id === currentUserId,
  );

  const currentUserRole = currentMember?.role ?? null;
  const currentMemberId = currentMember?.id ?? null;

  const canManageWorkspace =
    currentUserRole === "OWNER" || currentUserRole === "ADMIN";

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
    setSelectedMemberId("");
    setRemoveMemberError("");
    setUpdateMemberRoleError("");
    setMemberActionSuccess("");
  }

  async function handleRemoveSelectedMember() {
    if (!workspaceId || !selectedMemberId || isRemovingMember) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this member from the workspace?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsRemovingMember(true);
      setRemoveMemberError("");

      await removeMember(workspaceId, selectedMemberId);

      setMembers((prev) =>
        prev.filter((member) => member.id !== selectedMemberId),
      );

      setSelectedMemberId("");
      setShowMemberInfo(false);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setRemoveMemberError(error.message);
      } else {
        setRemoveMemberError("Could not remove member");
      }
    } finally {
      setIsRemovingMember(false);
    }
  }

  async function handleUpdateSelectedMemberRole(
    role: "OWNER" | "ADMIN" | "MEMBER",
  ) {
    if (!workspaceId || !selectedMemberId || isUpdatingMemberRole) {
      return;
    }

    try {
      setIsUpdatingMemberRole(true);
      setUpdateMemberRoleError("");

      const data = await updateMemberRole(workspaceId, selectedMemberId, role);

      setMembers((prev) =>
        prev.map((member) =>
          member.id === selectedMemberId
            ? {
                ...member,
                role: data.membership.role,
              }
            : member,
        ),
      );

      setMemberActionSuccess("Member role was updated successfully.");
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        removeAuthToken();
        navigate("/login");
        return;
      }

      if (error instanceof Error) {
        setUpdateMemberRoleError(error.message);
      } else {
        setUpdateMemberRoleError("Could not update member role");
      }
    } finally {
      setIsUpdatingMemberRole(false);
    }
  }

  if (!workspaceId) {
    return null;
  }

  return (
    <WorkspaceProvider
      value={{
        members,
        currentUserRole,
        currentMemberId,
        currentUserId,
        canManageWorkspace,
      }}
    >
      {showMemberInfo && selectedMember && (
        <MemberInfoModal
          member={selectedMember}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          isRemoving={isRemovingMember}
          removeError={removeMemberError}
          isUpdatingRole={isUpdatingMemberRole}
          updateRoleError={updateMemberRoleError}
          actionSuccess={memberActionSuccess}
          onClose={handleCloseMemberInfo}
          onRemove={handleRemoveSelectedMember}
          onUpdateRole={handleUpdateSelectedMemberRole}
        />
      )}
      <div className="flex w-full gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex justify-end xl:hidden">
            <button
              type="button"
              onClick={() => setIsMembersDrawerOpen(true)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              View members
            </button>
          </div>

          <Outlet />
        </div>

        <ContextSidebar>
          <div className="space-y-5">
            <WorkspaceMembersPanel
              workspaceId={workspaceId}
              members={members}
              currentUserId={currentUserId}
              canManageWorkspace={canManageWorkspace}
              onMemberClick={handleMemberClick}
            />

            <ActivityPanel
              activities={activities}
              isLoading={isLoadingActivities}
              error={activitiesError}
              onViewAllActivityClick={() => setIsMembersDrawerOpen(false)}
            />
          </div>
        </ContextSidebar>
      </div>

      <MobileDrawer
        isOpen={isMembersDrawerOpen}
        title="Workspace members"
        onClose={() => setIsMembersDrawerOpen(false)}
      >
        {workspaceId && (
          <div className="space-y-5">
            <WorkspaceMembersPanel
              workspaceId={workspaceId}
              members={members}
              currentUserId={currentUserId}
              canManageWorkspace={canManageWorkspace}
              onMemberClick={handleMemberClick}
            />

            <ActivityPanel
              activities={activities}
              isLoading={isLoadingActivities}
              error={activitiesError}
              onViewAllActivityClick={() => setIsMembersDrawerOpen(false)}
            />
          </div>
        )}
      </MobileDrawer>
    </WorkspaceProvider>
  );
}
