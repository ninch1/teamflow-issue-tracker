import asyncHandler from './asyncHandler';
import ErrorResponse from '../errors/ErrorResponse';
import prisma from '../lib/prisma';
import { WorkspaceRole } from '../generated/prisma/client';
import { AuthRequest } from '../types/auth';

// Middleware to protect routes from unauthorized role users
// put this middleware after authMiddleware to access user object

export default (roles: WorkspaceRole[]) => {
  return asyncHandler(async (req, res, next) => {
    const authReq = req as AuthRequest;
    const user = authReq.user;
    const workspaceId = req.params.workspaceId;

    if (!user) {
      return next(new ErrorResponse('Unauthorized access', 401));
    }

    if (typeof workspaceId !== 'string') {
      return next(new ErrorResponse('Workspace id is required', 400));
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return next(new ErrorResponse('Unauthorized access', 401));
    }

    if (!roles.includes(membership.role)) {
      return next(new ErrorResponse('Unauthorized access', 401));
    }

    next();
  });
};
