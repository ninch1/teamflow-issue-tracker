import express from 'express';
import {
  createIssue,
  deleteIssue,
  getIssue,
  getIssues,
  updateIssue,
} from '../controllers/issueController';
import authMiddleware from '../middleware/authMiddleware';
import workspaceRoleMiddleware from '../middleware/workspaceRoleMiddleware';
import { WorkspaceRole } from '../generated/prisma/client';
import {
  getIssueComments,
  createIssueComment,
  updateIssueComment,
  deleteIssueComment,
} from '../controllers/commentsController';
import {
  addLabelToIssue,
  removeLabelFromIssue,
} from '../controllers/labelController';

// mergeParams lets this router access :workspaceId and :projectId from app.ts mount path.
const issueRouter = express.Router({ mergeParams: true });

issueRouter
  .route('/')
  .get(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    getIssues,
  )
  .post(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    createIssue,
  );

issueRouter
  .route('/:issueId')
  .get(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    getIssue,
  )
  .patch(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    updateIssue,
  )
  .delete(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    deleteIssue,
  );

issueRouter
  .route('/:issueId/comments')
  .get(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    getIssueComments,
  )
  .post(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    createIssueComment,
  );

issueRouter
  .route('/:issueId/comments/:commentId')
  .patch(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    updateIssueComment,
  )
  .delete(
    authMiddleware,
    workspaceRoleMiddleware([
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
      WorkspaceRole.MEMBER,
    ]),
    deleteIssueComment,
  );

issueRouter
  .route('/:issueId/labels/:labelId')
  .post(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    addLabelToIssue,
  )
  .delete(
    authMiddleware,
    workspaceRoleMiddleware([WorkspaceRole.OWNER, WorkspaceRole.ADMIN]),
    removeLabelFromIssue,
  );

export default issueRouter;
