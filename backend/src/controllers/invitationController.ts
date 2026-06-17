import prisma from '../lib/prisma';
import ErrorResponse from '../errors/ErrorResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types/auth';
import {
  ActivityType,
  InvitationStatus,
  WorkspaceRole,
} from '../generated/prisma/client';
import { createActivity } from '../utils/createActivity';

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
      new ErrorResponse('Workspace id is required to send invitation', 400),
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
        'Unable to send invitation to this email address',
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

  // If an old invitation exists, only block duplicate pending invites.
  // Accepted/declined invitations can be reused because active membership
  // was already checked above, so the user is not currently in this workspace.
  if (existingInvitation) {
    if (existingInvitation.status === InvitationStatus.PENDING) {
      return next(
        new ErrorResponse(
          'This user already has a pending invitation to this workspace',
          400,
        ),
      );
    }

    const invitation = await prisma.workspaceInvitation.update({
      where: {
        id: existingInvitation.id,
      },
      data: {
        status: InvitationStatus.PENDING,
        role: WorkspaceRole.MEMBER,
        invitedById: user.id,
      },
    });

    return res.status(200).json({
      message: 'Invitation was sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        workspaceId: invitation.workspaceId,
        invitedById: invitation.invitedById,
        createdAt: invitation.createdAt,
        updatedAt: invitation.updatedAt,
      },
    });
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

// Gets all invitations for workspace based on id
export const getWorkspaceInvitations = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const workspaceId = req.params.workspaceId;
  if (typeof workspaceId !== 'string') {
    return next(
      new ErrorResponse('Workspace id is required to get invitations', 400),
    );
  }

  const invitations = await prisma.workspaceInvitation.findMany({
    where: {
      workspaceId,
    },
  });

  const invitationsResponse = invitations.map((invitation) => {
    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      workspaceId: invitation.workspaceId,
      invitedById: invitation.invitedById,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    };
  });

  return res.status(200).json({
    message: 'Got all invitations successfully',
    invitationsResponse,
  });
});

// Gets all invitations for user
export const getMyInvitations = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  // returns only pending invitations
  const invitations = await prisma.workspaceInvitation.findMany({
    where: {
      email: user.email,
      status: InvitationStatus.PENDING,
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const invitationsResponse = invitations.map((invitation) => {
    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      workspace: invitation.workspace,
      invitedById: invitation.invitedById,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
    };
  });

  return res.status(200).json({
    message: 'Got all invitations successfully',
    invitationsResponse,
  });
});

// Accept invitation
export const acceptInvitation = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const invitationId = req.params.invitationId;
  if (typeof invitationId !== 'string') {
    return next(new ErrorResponse('Please choose invitation', 400));
  }

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  if (!invitation) {
    return next(new ErrorResponse('Invitation was not found', 404));
  }

  if (invitation.email !== user.email) {
    return next(new ErrorResponse('You cannot accept this invitation', 401));
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    return next(
      new ErrorResponse('You already have responded to this invitation', 400),
    );
  }

  // Check if user is already a member of this workspace.
  const existingMembership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: invitation.workspaceId,
      },
    },
  });

  if (existingMembership) {
    return next(
      new ErrorResponse('You are already a member of this workspace', 400),
    );
  }

  const [updatedInvitation, membership] = await prisma.$transaction([
    prisma.workspaceInvitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: InvitationStatus.ACCEPTED,
      },
    }),

    prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: invitation.workspaceId,
        role: invitation.role,
      },
    }),
  ]);

  await createActivity({
    workspaceId: invitation.workspaceId,
    userId: user.id,
    type: ActivityType.WORKSPACE_MEMBER_ADDED,
    message: `${user.name} joined the workspace`,
  });

  return res.status(200).json({
    message: 'Invitation accepted successfully',
    invitation: {
      id: updatedInvitation.id,
      email: updatedInvitation.email,
      role: updatedInvitation.role,
      status: updatedInvitation.status,
      workspaceId: updatedInvitation.workspaceId,
      updatedAt: updatedInvitation.updatedAt,
    },
    membership: {
      id: membership.id,
      userId: membership.userId,
      workspaceId: membership.workspaceId,
      role: membership.role,
      createdAt: membership.createdAt,
    },
  });
});

// Decline invitation
export const declineInvitation = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const invitationId = req.params.invitationId;
  if (typeof invitationId !== 'string') {
    return next(new ErrorResponse('Please choose invitation', 400));
  }

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  if (!invitation) {
    return next(new ErrorResponse('Invitation was not found', 404));
  }

  if (invitation.email !== user.email) {
    return next(new ErrorResponse('You cannot decline this invitation', 401));
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    return next(
      new ErrorResponse('You already have responded to this invitation', 400),
    );
  }

  // Check if user is already a member of this workspace.
  const existingMembership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: invitation.workspaceId,
      },
    },
  });

  if (existingMembership) {
    return next(
      new ErrorResponse('You are already a member of this workspace', 400),
    );
  }

  const updatedInvitation = await prisma.workspaceInvitation.update({
    where: {
      id: invitation.id,
    },
    data: {
      status: InvitationStatus.DECLINED,
    },
  });

  return res.status(200).json({
    message: 'Invitation declined successfully',
    invitation: {
      id: updatedInvitation.id,
      email: updatedInvitation.email,
      role: updatedInvitation.role,
      status: updatedInvitation.status,
      workspaceId: updatedInvitation.workspaceId,
      updatedAt: updatedInvitation.updatedAt,
    },
  });
});
