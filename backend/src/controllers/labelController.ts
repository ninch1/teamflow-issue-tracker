import prisma from '../lib/prisma';
import ErrorResponse from '../errors/ErrorResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types/auth';

export const getWorkspaceLabels = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const { workspaceId } = req.params;

  if (typeof workspaceId !== 'string') {
    return next(new ErrorResponse('Workspace id is required', 400));
  }

  const labels = await prisma.label.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return res.status(200).json({
    message: 'Labels retrieved successfully',
    labels,
  });
});

export const createWorkspaceLabel = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const { workspaceId } = req.params;

  if (typeof workspaceId !== 'string') {
    return next(new ErrorResponse('Workspace id is required', 400));
  }

  const { name, color } = req.body;

  if (typeof name !== 'string' || !name.trim()) {
    return next(new ErrorResponse('Label name is required', 400));
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 30) {
    return next(
      new ErrorResponse('Label name must be 30 characters or less', 400),
    );
  }

  if (color !== undefined && color !== null && typeof color !== 'string') {
    return next(new ErrorResponse('Label color must be a string', 400));
  }

  const trimmedColor =
    typeof color === 'string' && color.trim() ? color.trim() : null;

  const existingLabel = await prisma.label.findUnique({
    where: {
      workspaceId_name: {
        workspaceId,
        name: trimmedName,
      },
    },
  });

  if (existingLabel) {
    return next(new ErrorResponse('Label already exists', 400));
  }

  const label = await prisma.label.create({
    data: {
      name: trimmedName,
      color: trimmedColor,
      workspaceId,
    },
  });

  return res.status(201).json({
    message: 'Label created successfully',
    label,
  });
});

export const addLabelToIssue = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const { workspaceId, projectId, issueId, labelId } = req.params;

  if (typeof workspaceId !== 'string') {
    return next(new ErrorResponse('Workspace id is required', 400));
  }

  if (typeof projectId !== 'string') {
    return next(new ErrorResponse('Project id is required', 400));
  }

  if (typeof issueId !== 'string') {
    return next(new ErrorResponse('Issue id is required', 400));
  }

  if (typeof labelId !== 'string') {
    return next(new ErrorResponse('Label id is required', 400));
  }

  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      projectId,
      project: {
        workspaceId,
      },
    },
  });

  if (!issue) {
    return next(new ErrorResponse('Issue not found', 404));
  }

  const label = await prisma.label.findFirst({
    where: {
      id: labelId,
      workspaceId,
    },
  });

  if (!label) {
    return next(new ErrorResponse('Label not found', 404));
  }

  const issueLabel = await prisma.issueLabel.upsert({
    where: {
      issueId_labelId: {
        issueId,
        labelId,
      },
    },
    update: {},
    create: {
      issueId,
      labelId,
    },
    include: {
      label: true,
    },
  });

  return res.status(201).json({
    message: 'Label added to issue successfully',
    issueLabel,
  });
});

export const removeLabelFromIssue = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse('Unauthorized access', 401));
  }

  const { workspaceId, projectId, issueId, labelId } = req.params;

  if (typeof workspaceId !== 'string') {
    return next(new ErrorResponse('Workspace id is required', 400));
  }

  if (typeof projectId !== 'string') {
    return next(new ErrorResponse('Project id is required', 400));
  }

  if (typeof issueId !== 'string') {
    return next(new ErrorResponse('Issue id is required', 400));
  }

  if (typeof labelId !== 'string') {
    return next(new ErrorResponse('Label id is required', 400));
  }

  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      projectId,
      project: {
        workspaceId,
      },
    },
  });

  if (!issue) {
    return next(new ErrorResponse('Issue not found', 404));
  }

  const issueLabel = await prisma.issueLabel.findUnique({
    where: {
      issueId_labelId: {
        issueId,
        labelId,
      },
    },
  });

  if (!issueLabel) {
    return next(new ErrorResponse('Issue label not found', 404));
  }

  await prisma.issueLabel.delete({
    where: {
      issueId_labelId: {
        issueId,
        labelId,
      },
    },
  });

  return res.status(200).json({
    message: 'Label removed from issue successfully',
    issueLabel: {
      issueId,
      labelId,
    },
  });
});
