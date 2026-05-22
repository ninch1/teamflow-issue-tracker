import prisma from '../lib/prisma';
import ErrorResponse from '../errors/ErrorResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types/auth';

// Creates a new workspace. Required parameter: name.
export const createWorkspace = asyncHandler(async (req, res, next) => {
  // Get authenticated user added by authMiddleware.
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  // Validate workspace name from request body.
  const name = req.body.name;

  if (typeof name !== 'string') {
    return next(new ErrorResponse('Workspace name is required', 400));
  }

  const trimmedName = name.trim();

  const workspaceNameRegex = /^[A-Za-z0-9 _'-]{2,50}$/;

  if (!workspaceNameRegex.test(trimmedName)) {
    return next(
      new ErrorResponse(
        'Workspace name must be 2-50 characters and can include letters, numbers, spaces, hyphens, underscores, and apostrophes',
        400,
      ),
    );
  }

  // Create workspace and add current user as OWNER.
  const workspace = await prisma.workspace.create({
    data: {
      name: trimmedName,
      workspaceMembers: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  return res.status(201).json({
    message: 'Workspace created successfully',
    workspace,
  });
});

// Gets all workspaces for the authenticated user.
export const getWorkspaces = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  // Find all workspace memberships for the current user.
  const workspaces = await prisma.workspaceMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      workspace: true,
    },
  });

  // Shape response to return workspace data plus user's role.
  const workspacesResponse = workspaces.map((membership) => {
    return {
      id: membership.workspace.id,
      name: membership.workspace.name,
      role: membership.role,
      createdAt: membership.workspace.createdAt,
      updatedAt: membership.workspace.updatedAt,
    };
  });

  return res
    .status(200)
    .json({ message: 'Got all workspaces', workspaces: workspacesResponse });
});

// Deletes workspace based on id
export const deleteWorkspace = asyncHandler(async (req, res, next) => {
  // Get authenticated user added by authMiddleware.
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== 'string') {
    return next(new ErrorResponse('Workspace id is required', 400));
  }

  // Use a transaction so memberships and workspace are deleted together.
  const [, deletedWorkspace] = await prisma.$transaction([
    prisma.workspaceMember.deleteMany({
      where: {
        workspaceId,
      },
    }),

    prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    }),
  ]);

  return res.status(200).json({
    message: 'Workspace deleted successfully',
    workspace: {
      id: deletedWorkspace.id,
      name: deletedWorkspace.name,
    },
  });
});

// Gets single workspace by id.
export const getWorkspace = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== 'string') {
    return next(new ErrorResponse('Workspace id is required', 400));
  }

  // gets workspace by matching unique workspace id and user id on WorkspaceMember
  const workspaceMember = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
    include: {
      workspace: true,
    },
  });

  if (!workspaceMember)
    return next(new ErrorResponse('Workspace not found', 404));

  // Shape response to return workspace data plus user's role.
  const workspaceResponse = {
    id: workspaceMember.workspace.id,
    name: workspaceMember.workspace.name,
    role: workspaceMember.role,
    createdAt: workspaceMember.workspace.createdAt,
  };

  return res
    .status(200)
    .json({ message: 'Got workspace', workspaces: workspaceResponse });
});
