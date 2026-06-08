import express from 'express';
import {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  deleteWorkspace,
  updateWorkspace,
} from '../controllers/workspaceController';
import {
  sendInvitation,
  getWorkspaceInvitations,
} from '../controllers/invitationController';
import {
  getWorkspaceMembers,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from '../controllers/workspaceMemberController';
import authMiddleware from '../middleware/authMiddleware';
import workspaceRoleMiddleware from '../middleware/workspaceRoleMiddleware';
import { WorkspaceRole } from '../generated/prisma/client';

const workspaceRouter = express.Router();

// Protected workspace routes.
// GET /api/workspace - get current user's workspaces.
// POST /api/workspace - create a workspace and make current user OWNER.
// DELETE /api/workspace/:workspaceId - delete a workspace. OWNER only.
// GET /api/workspace/:workspaceId - get a single workspace if current user is a member.
// PATCH /api/workspace/:workspaceId - update workspace name. OWNER or ADMIN only.
// POST /api/workspace/:workspaceId/invitations - invite a user to workspace. OWNER or ADMIN only.
// GET /api/workspace/:workspaceId/members - get all members of workspace.
// PATCH /api/workspace/:workspaceId/members/:memberId/role - update member role. OWNER only.
// DELETE /api/workspace/:workspaceId/members/:memberId - remove member. OWNER only.
workspaceRouter
  .route('/')
  .get(authMiddleware, getWorkspaces)
  .post(authMiddleware, createWorkspace);

workspaceRouter
  .route('/:workspaceId')
  .get(authMiddleware, getWorkspace)
  .patch(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    updateWorkspace,
  )
  .delete(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER]),
    deleteWorkspace,
  );

workspaceRouter
  .route('/:workspaceId/invitations')
  .get(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    getWorkspaceInvitations,
  )
  .post(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    sendInvitation,
  );

workspaceRouter
  .route('/:workspaceId/members')
  .get(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    getWorkspaceMembers,
  );

workspaceRouter
  .route('/:workspaceId/members/:memberId/role')
  .patch(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER]),
    updateWorkspaceMemberRole,
  );

workspaceRouter
  .route('/:workspaceId/members/:memberId')
  .delete(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    removeWorkspaceMember,
  );

export default workspaceRouter;
