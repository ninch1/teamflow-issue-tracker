import express from 'express';
import {
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
} from '../controllers/invitationController';
import authMiddleware from '../middleware/authMiddleware';

const invitationRouter = express.Router();

invitationRouter.route('/me').get(authMiddleware, getMyInvitations);

invitationRouter
  .route('/:invitationId/accept')
  .patch(authMiddleware, acceptInvitation);

invitationRouter
  .route('/:invitationId/decline')
  .patch(authMiddleware, declineInvitation);

export default invitationRouter;
