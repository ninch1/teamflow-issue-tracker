import prisma from "../lib/prisma";
import ErrorResponse from "../errors/ErrorResponse";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../types/auth";
import { createActivity } from "../utils/createActivity";
import { ActivityType, WorkspaceRole } from "../generated/prisma/client";

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

export const updateIssueComment = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const { workspaceId, projectId, issueId, commentId } = req.params;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof projectId !== "string") {
    return next(new ErrorResponse("Project id is required", 400));
  }

  if (typeof issueId !== "string") {
    return next(new ErrorResponse("Issue id is required", 400));
  }

  if (typeof commentId !== "string") {
    return next(new ErrorResponse("Comment id is required", 400));
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

  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      issueId,
      issue: {
        projectId,
        project: {
          workspaceId,
        },
      },
    },
    include: {
      issue: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!comment) {
    return next(new ErrorResponse("Comment not found", 404));
  }

  const currentMember = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
  });

  if (!currentMember) {
    return next(new ErrorResponse("Workspace membership not found", 403));
  }

  const canManageComment =
    currentMember.role === WorkspaceRole.OWNER ||
    currentMember.role === WorkspaceRole.ADMIN;

  const isCommentAuthor = comment.userId === user.id;

  if (!canManageComment && !isCommentAuthor) {
    return next(
      new ErrorResponse("You are not allowed to update this comment", 403),
    );
  }

  const updatedComment = await prisma.comment.update({
    where: {
      id: comment.id,
    },
    data: {
      body: trimmedBody,
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
    message: "Comment updated successfully",
    comment: updatedComment,
  });
});

export const deleteIssueComment = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const { workspaceId, projectId, issueId, commentId } = req.params;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof projectId !== "string") {
    return next(new ErrorResponse("Project id is required", 400));
  }

  if (typeof issueId !== "string") {
    return next(new ErrorResponse("Issue id is required", 400));
  }

  if (typeof commentId !== "string") {
    return next(new ErrorResponse("Comment id is required", 400));
  }

  const comment = await prisma.comment.findFirst({
    where: {
      id: commentId,
      issueId,
      issue: {
        projectId,
        project: {
          workspaceId,
        },
      },
    },
  });

  if (!comment) {
    return next(new ErrorResponse("Comment not found", 404));
  }

  const currentMember = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
  });

  if (!currentMember) {
    return next(new ErrorResponse("Workspace membership not found", 403));
  }

  const canManageComment =
    currentMember.role === "OWNER" || currentMember.role === "ADMIN";

  const isCommentAuthor = comment.userId === user.id;

  if (!canManageComment && !isCommentAuthor) {
    return next(
      new ErrorResponse("You are not allowed to delete this comment", 403),
    );
  }

  const deletedComment = await prisma.comment.delete({
    where: {
      id: comment.id,
    },
  });

  return res.status(200).json({
    message: "Comment deleted successfully",
    comment: {
      id: deletedComment.id,
    },
  });
});
