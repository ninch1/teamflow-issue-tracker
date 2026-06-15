import prisma from "../lib/prisma";
import ErrorResponse from "../errors/ErrorResponse";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../types/auth";
import { ActivityType } from "../generated/prisma/client";
import { createActivity } from "../utils/createActivity";

// Get comments for one issue.
export const getIssueComments = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const workspaceId = req.params.workspaceId;
  const projectId = req.params.projectId;
  const issueId = req.params.issueId;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof projectId !== "string") {
    return next(new ErrorResponse("Project id is required", 400));
  }

  if (typeof issueId !== "string") {
    return next(new ErrorResponse("Issue id is required", 400));
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
    return next(new ErrorResponse("Issue not found", 404));
  }

  const comments = await prisma.comment.findMany({
    where: {
      issueId,
    },
    orderBy: {
      createdAt: "asc",
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
  });

  return res.status(200).json({
    message: "Comments retrieved successfully",
    comments,
  });
});

// Create comment for one issue.
export const createIssueComment = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const workspaceId = req.params.workspaceId;
  const projectId = req.params.projectId;
  const issueId = req.params.issueId;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof projectId !== "string") {
    return next(new ErrorResponse("Project id is required", 400));
  }

  if (typeof issueId !== "string") {
    return next(new ErrorResponse("Issue id is required", 400));
  }

  if (!req.body) {
    return next(new ErrorResponse("Comment data is required", 400));
  }

  const { body } = req.body;

  if (typeof body !== "string") {
    return next(new ErrorResponse("Comment body is required", 400));
  }

  const trimmedBody = body.trim();

  if (trimmedBody.length < 1) {
    return next(new ErrorResponse("Comment body is required", 400));
  }

  if (trimmedBody.length > 1000) {
    return next(
      new ErrorResponse("Comment body must be 1000 characters or less", 400),
    );
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
    return next(new ErrorResponse("Issue not found", 404));
  }

  const comment = await prisma.comment.create({
    data: {
      body: trimmedBody,
      issueId: issue.id,
      userId: user.id,
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
  });

  await createActivity({
    workspaceId,
    projectId,
    issueId: issue.id,
    userId: user.id,
    type: ActivityType.COMMENT_ADDED,
    message: `${user.name} commented on issue "${issue.title}"`,
  });

  return res.status(201).json({
    message: "Comment created successfully",
    comment,
  });
});
