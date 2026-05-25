import express from 'express';
import { getMyInvitations } from '../controllers/invitationController';
import authMiddleware from '../middleware/authMiddleware';
import workspaceRoleMiddleware from '../middleware/workspaceRoleMiddleware';
import { WorkspaceRole } from '../generated/prisma/client';

const invitationRouter = express.Router();

invitationRouter.route('/me').get(authMiddleware, getMyInvitations);

export default invitationRouter;
