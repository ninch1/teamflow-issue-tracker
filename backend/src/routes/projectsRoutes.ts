import express from 'express';
import {
  createProject,
  getProjects,
  getProject,
  deleteProject,
} from '../controllers/projectController';
import authMiddleware from '../middleware/authMiddleware';
import workspaceRoleMiddleware from '../middleware/workspaceRoleMiddleware';
import { WorkspaceRole } from '../generated/prisma/client';

// mergeParams lets this router access :workspaceId from app.ts mount path.
const projectsRouter = express.Router({ mergeParams: true });

projectsRouter
  .route('/')
  .get(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    getProjects,
  )
  .post(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    createProject,
  );

projectsRouter
  .route('/:projectId')
  .get(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    getProject,
  )
  .delete(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    deleteProject,
  );

export default projectsRouter;
