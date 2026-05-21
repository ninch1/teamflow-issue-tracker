import express from 'express';
import {
  createWorkspace,
  getWorkspaces,
} from '../controllers/workspaceController';
import authMiddleware from '../middleware/authMiddleware';

const workspaceRouter = express.Router();

// Protected workspace routes.
// GET /api/workspace - get current user's workspaces.
// POST /api/workspace - create a workspace and make current user OWNER.
workspaceRouter
  .route('/')
  .get(authMiddleware, getWorkspaces)
  .post(authMiddleware, createWorkspace);

export default workspaceRouter;
