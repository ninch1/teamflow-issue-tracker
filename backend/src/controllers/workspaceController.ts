import prisma from '../lib/prisma';
import ErrorResponse from '../errors/ErrorResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types/auth';
import { WorkspaceRole } from '@prisma/client';

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

  const description = req.body.description;

  if (description !== undefined && typeof description !== 'string') {
    return next(new ErrorResponse('Description must be text', 400));
  }

  const trimmedDescription = description?.trim();

  if (trimmedDescription && trimmedDescription.length > 300) {
    return next(
      new ErrorResponse('Description must be 300 characters or less', 400),
    );
  }

  // Create workspace and add current user as OWNER.
  const workspace = await prisma.workspace.create({
    data: {
      name: trimmedName,
      description: trimmedDescription || null,
      workspaceMembers: {
        create: {
          userId: user.id,
          role: WorkspaceRole.OWNER,
        },
      },
    },
  });

  return res.status(201).json({
    message: 'Workspace created successfully',
    workspace: {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      role: WorkspaceRole.OWNER,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    },
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
      description: membership.workspace.description,
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
    description: workspaceMember.workspace.description,
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

  // Use a transaction so workspace-related data is deleted together.
  // Delete child records first, then delete the workspace.
  const deletedWorkspace = await prisma.$transaction(async (tx) => {
    await tx.activity.deleteMany({
      where: {
        workspaceId,
      },
    });

    await tx.workspaceInvitation.deleteMany({
      where: {
        workspaceId,
      },
    });

    await tx.comment.deleteMany({
      where: {
        issue: {
          project: {
            workspaceId,
          },
        },
      },
    });

    await tx.issue.deleteMany({
      where: {
        project: {
          workspaceId,
        },
      },
    });

    await tx.project.deleteMany({
      where: {
        workspaceId,
      },
    });

    await tx.workspaceMember.deleteMany({
      where: {
        workspaceId,
      },
    });

    return tx.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
  });

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
    return next(new ErrorResponse('Update data is required', 400));
  }

  const updateData: {
    name?: string;
    description?: string | null;
  } = {};

  const newName = updateInfo.name;

  if (newName !== undefined) {
    if (typeof newName !== 'string') {
      return next(new ErrorResponse('Workspace name must be text', 400));
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

    updateData.name = trimmedName;
  }

  const newDescription = updateInfo.description;

  if (newDescription !== undefined) {
    if (typeof newDescription !== 'string') {
      return next(new ErrorResponse('Description must be text', 400));
    }

    const trimmedDescription = newDescription.trim();

    if (trimmedDescription.length > 300) {
      return next(
        new ErrorResponse('Description must be 300 characters or less', 400),
      );
    }

    updateData.description = trimmedDescription || null;
  }

  if (Object.keys(updateData).length === 0) {
    return next(new ErrorResponse('No update fields provided', 400));
  }

  const updatedWorkspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: updateData,
  });

  return res.status(200).json({
    message: 'Workspace updated successfully',
    workspace: {
      id: updatedWorkspace.id,
      name: updatedWorkspace.name,
      description: updatedWorkspace.description,
      createdAt: updatedWorkspace.createdAt,
      updatedAt: updatedWorkspace.updatedAt,
    },
  });
});
