import express from 'express';
import {
  createWorkspaceLabel,
  getWorkspaceLabels,
} from '../controllers/labelController';
import authMiddleware from '../middleware/authMiddleware';
import workspaceRoleMiddleware from '../middleware/workspaceRoleMiddleware';
import { WorkspaceRole } from '../generated/prisma/client';

const labelRouter = express.Router({ mergeParams: true });

labelRouter
  .route('/')
  .get(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    getWorkspaceLabels,
  )
  .post(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    createWorkspaceLabel,
  );

export default labelRouter;
