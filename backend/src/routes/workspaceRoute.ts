import express from 'express';
import {
  createWorkspace,
  getWorkspaces,
  deleteWorkspace,
} from '../controllers/workspaceController';
import authMiddleware from '../middleware/authMiddleware';
import workspaceRoleMiddleware from '../middleware/workspaceRoleMiddleware';
import { WorkspaceRole } from '../generated/prisma/client';

const workspaceRouter = express.Router();

// Protected workspace routes.
// GET /api/workspace - get current user's workspaces.
// POST /api/workspace - create a workspace and make current user OWNER.
workspaceRouter
  .route('/')
  .get(authMiddleware, getWorkspaces)
  .post(authMiddleware, createWorkspace);

workspaceRouter
  .route('/:workspaceId')
  .delete(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER]),
    deleteWorkspace,
  );

export default workspaceRouter;
