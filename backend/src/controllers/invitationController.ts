import prisma from '../lib/prisma';
import ErrorResponse from '../errors/ErrorResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types/auth';

export const sendInvitation = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  if (!req.body) {
    return next(new ErrorResponse('Email is required to send invitation', 400));
  }

  const email = req.body.email;

  if (typeof email !== 'string') {
    return next(new ErrorResponse('Email is required', 400));
  }

  const trimmedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return next(new ErrorResponse('Invalid email', 400));
  }

  const workspaceId = req.params.workspaceId;
  if (typeof workspaceId !== 'string') {
    return next(
      new ErrorResponse('Please choose workspace to send invitation', 400),
    );
  }

  // Find the registered user being invited.
  const invitedUser = await prisma.user.findUnique({
    where: {
      email: trimmedEmail,
    },
  });

  if (!invitedUser) {
    return next(
      new ErrorResponse(
        'The user you are trying to invite does not exist',
        400,
      ),
    );
  }

  if (invitedUser.id === user.id) {
    return next(new ErrorResponse('You cannot invite yourself', 400));
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: invitedUser.id,
        workspaceId,
      },
    },
  });

  if (membership) {
    return next(
      new ErrorResponse('User is already a member of this workspace', 400),
    );
  }

  // checking if this invitation has already been sent
  const existingInvitation = await prisma.workspaceInvitation.findUnique({
    where: {
      email_workspaceId: {
        email: trimmedEmail,
        workspaceId,
      },
    },
  });

  if (existingInvitation) {
    return next(
      new ErrorResponse(
        'This user already has an invitation to this workspace',
        400,
      ),
    );
  }

  const invitation = await prisma.workspaceInvitation.create({
    data: {
      email: trimmedEmail,
      workspaceId,
      invitedById: user.id,
    },
  });

  return res.status(201).json({
    message: 'User was invited successfully to workspace',
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      workspaceId: invitation.workspaceId,
      invitedById: invitation.invitedById,
      createdAt: invitation.createdAt,
    },
  });
});
