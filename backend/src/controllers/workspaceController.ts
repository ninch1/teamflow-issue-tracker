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
    updatedAt: workspaceMember.workspace.updatedAt,
  };

  return res
    .status(200)
    .json({ message: 'Got workspace', workspace: workspaceResponse });
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

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
  });

  if (!workspace) {
    return next(new ErrorResponse('Workspace not found', 404));
  }

  // Use a transaction so memberships and workspace are deleted together.
  // Deleting Workspace also deletes Issues and Projects
  const [, , , deletedWorkspace] = await prisma.$transaction([
    prisma.issue.deleteMany({
      where: {
        project: {
          workspaceId,
        },
      },
    }),

    prisma.project.deleteMany({
      where: {
        workspaceId,
      },
    }),

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

// allows user with OWNER and ADMIN role to update workspace.
export const updateWorkspace = asyncHandler(async (req, res, next) => {
  // Get authenticated user added by authMiddleware.
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== 'string') {
    return next(new ErrorResponse('Workspace id is required to update', 400));
  }

  const updateInfo = req.body;
  if (!updateInfo) {
    return next(new ErrorResponse('Updated name is required to update', 400));
  }
  const newName = updateInfo.name;

  if (typeof newName !== 'string') {
    return next(new ErrorResponse('Updated name is required to update', 400));
  }

  const trimmedName = newName.trim();

  const workspaceNameRegex = /^[A-Za-z0-9 _'-]{2,50}$/;

  if (!workspaceNameRegex.test(trimmedName)) {
    return next(
      new ErrorResponse(
        'Workspace name must be 2-50 characters and can include letters, numbers, spaces, hyphens, underscores, and apostrophes',
        400,
      ),
    );
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      name: trimmedName,
    },
  });

  return res.status(200).json({
    message: 'Workspace updated successfully',
    workspace: {
      id: updatedWorkspace.id,
      name: updatedWorkspace.name,
    },
  });
});

// gets all users of workspace
export const getWorkspaceMembers = asyncHandler(async (req, res, next) => {
  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== 'string') {
    return next(new ErrorResponse('Workspace id is required', 400));
  }

  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const membersResponse = members.map((member) => {
    return {
      id: member.id,
      role: member.role,
      joinedAt: member.createdAt,
      user: member.user,
    };
  });

  return res.status(200).json({
    message: 'Got workspace members successfully',
    members: membersResponse,
  });
});
