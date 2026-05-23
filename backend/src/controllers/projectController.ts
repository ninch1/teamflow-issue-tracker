import prisma from '../lib/prisma';
import ErrorResponse from '../errors/ErrorResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types/auth';

export const createProject = asyncHandler(async (req, res, next) => {
  // Get authenticated user added by authMiddleware.
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  // Get workspace id from parent route: /api/workspace/:workspaceId/projects.
  const workspaceId = req.params.workspaceId;
  if (typeof workspaceId !== 'string') {
    return next(
      new ErrorResponse('Please choose workspace to create project', 400),
    );
  }

  // Validate project name from request body.
  if (!req.body) {
    return next(new ErrorResponse('Name is required to create project', 400));
  }

  const projectName = req.body.name;

  if (typeof projectName !== 'string') {
    return next(new ErrorResponse('Name is required to create project', 400));
  }

  const trimmedName = projectName.trim();

  const projectNameRegex = /^[A-Za-z0-9 _'-]{2,50}$/;

  if (!projectNameRegex.test(trimmedName)) {
    return next(
      new ErrorResponse(
        'Project name must be 2-50 characters and can include letters, numbers, spaces, hyphens, underscores, and apostrophes',
        400,
      ),
    );
  }

  // Create project inside the selected workspace.
  const project = await prisma.project.create({
    data: {
      name: trimmedName,
      workspaceId,
    },
  });

  return res.status(201).json({
    message: 'Created new project successfully',
    project: {
      id: project.id,
      name: project.name,
      workspaceId: project.workspaceId,
      createdAt: project.createdAt,
    },
  });
});
