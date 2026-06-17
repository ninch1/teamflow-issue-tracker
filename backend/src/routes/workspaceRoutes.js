"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workspaceController_1 = require("../controllers/workspaceController");
const invitationController_1 = require("../controllers/invitationController");
const workspaceMemberController_1 = require("../controllers/workspaceMemberController");
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const workspaceRoleMiddleware_1 = __importDefault(require("../middleware/workspaceRoleMiddleware"));
const client_1 = require("../generated/prisma/client");
const activityController_1 = require("../controllers/activityController");
const workspaceRouter = express_1.default.Router();
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
    .route("/")
    .get(authMiddleware_1.default, workspaceController_1.getWorkspaces)
    .post(authMiddleware_1.default, workspaceController_1.createWorkspace);
workspaceRouter
    .route("/:workspaceId")
    .get(authMiddleware_1.default, workspaceController_1.getWorkspace)
    .patch(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), workspaceController_1.updateWorkspace)
    .delete(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER]), workspaceController_1.deleteWorkspace);
workspaceRouter
    .route("/:workspaceId/invitations")
    .get(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), invitationController_1.getWorkspaceInvitations)
    .post(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), invitationController_1.sendInvitation);
workspaceRouter
    .route("/:workspaceId/members")
    .get(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), workspaceMemberController_1.getWorkspaceMembers);
workspaceRouter
    .route("/:workspaceId/members/me")
    .delete(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), workspaceMemberController_1.leaveWorkspace);
workspaceRouter
    .route("/:workspaceId/members/:memberId/role")
    .patch(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER]), workspaceMemberController_1.updateWorkspaceMemberRole);
workspaceRouter
    .route("/:workspaceId/members/:memberId")
    .delete(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([client_1.WorkspaceRole.OWNER, client_1.WorkspaceRole.ADMIN]), workspaceMemberController_1.removeWorkspaceMember);
workspaceRouter
    .route("/:workspaceId/activities")
    .get(authMiddleware_1.default, (0, workspaceRoleMiddleware_1.default)([
    client_1.WorkspaceRole.OWNER,
    client_1.WorkspaceRole.ADMIN,
    client_1.WorkspaceRole.MEMBER,
]), activityController_1.getActivities);
exports.default = workspaceRouter;
