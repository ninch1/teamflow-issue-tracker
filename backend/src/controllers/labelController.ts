import prisma from "../lib/prisma";
import ErrorResponse from "../errors/ErrorResponse";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../types/auth";

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

function getLabelColorValidationError(
  color: unknown,
): string | null | undefined {
  if (color === undefined) {
    return undefined;
  }

  if (color === null) {
    return null;
  }

  if (typeof color !== "string") {
    return "Label color must be a string";
  }

  const trimmedColor = color.trim();

  if (!trimmedColor) {
    return null;
  }

  if (!HEX_COLOR_REGEX.test(trimmedColor)) {
    return "Label color must be a valid hex color";
  }

  return null;
}

export const getWorkspaceLabels = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const { workspaceId } = req.params;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  const labels = await prisma.label.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return res.status(200).json({
    message: "Labels retrieved successfully",
    labels,
  });
});

export const createWorkspaceLabel = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const { workspaceId } = req.params;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  const { name, color } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return next(new ErrorResponse("Label name is required", 400));
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 30) {
    return next(
      new ErrorResponse("Label name must be 30 characters or less", 400),
    );
  }

  if (color !== undefined && color !== null && typeof color !== "string") {
    return next(new ErrorResponse("Label color must be a string", 400));
  }

  const colorValidationError = getLabelColorValidationError(color);

  if (colorValidationError) {
    return next(new ErrorResponse(colorValidationError, 400));
  }

  const trimmedColor =
    typeof color === "string" && color.trim() ? color.trim() : null;

  const existingLabel = await prisma.label.findUnique({
    where: {
      workspaceId_name: {
        workspaceId,
        name: trimmedName,
      },
    },
  });

  if (existingLabel) {
    return next(new ErrorResponse("Label already exists", 400));
  }

  const label = await prisma.label.create({
    data: {
      name: trimmedName,
      color: trimmedColor,
      workspaceId,
    },
  });

  return res.status(201).json({
    message: "Label created successfully",
    label,
  });
});

export const addLabelToIssue = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const { workspaceId, projectId, issueId, labelId } = req.params;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof projectId !== "string") {
    return next(new ErrorResponse("Project id is required", 400));
  }

  if (typeof issueId !== "string") {
    return next(new ErrorResponse("Issue id is required", 400));
  }

  if (typeof labelId !== "string") {
    return next(new ErrorResponse("Label id is required", 400));
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

  const label = await prisma.label.findFirst({
    where: {
      id: labelId,
      workspaceId,
    },
  });

  if (!label) {
    return next(new ErrorResponse("Label not found", 404));
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
    message: "Label added to issue successfully",
    issueLabel,
  });
});

export const removeLabelFromIssue = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const { workspaceId, projectId, issueId, labelId } = req.params;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof projectId !== "string") {
    return next(new ErrorResponse("Project id is required", 400));
  }

  if (typeof issueId !== "string") {
    return next(new ErrorResponse("Issue id is required", 400));
  }

  if (typeof labelId !== "string") {
    return next(new ErrorResponse("Label id is required", 400));
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

  const issueLabel = await prisma.issueLabel.findUnique({
    where: {
      issueId_labelId: {
        issueId,
        labelId,
      },
    },
  });

  if (!issueLabel) {
    return next(new ErrorResponse("Issue label not found", 404));
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
    message: "Label removed from issue successfully",
    issueLabel: {
      issueId,
      labelId,
    },
  });
});

export const updateWorkspaceLabel = asyncHandler(async (req, res, next) => {
  const { workspaceId, labelId } = req.params;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof labelId !== "string") {
    return next(new ErrorResponse("Label id is required", 400));
  }

  const { name, color } = req.body;

  if (name !== undefined && typeof name !== "string") {
    return next(new ErrorResponse("Label name must be a string", 400));
  }

  if (color !== undefined && color !== null && typeof color !== "string") {
    return next(new ErrorResponse("Label color must be a string", 400));
  }

  const colorValidationError = getLabelColorValidationError(color);

  if (colorValidationError) {
    return next(new ErrorResponse(colorValidationError, 400));
  }

  const trimmedName = typeof name === "string" ? name.trim() : undefined;

  if (trimmedName !== undefined && trimmedName.length < 1) {
    return next(new ErrorResponse("Label name is required", 400));
  }

  if (trimmedName !== undefined && trimmedName.length > 30) {
    return next(
      new ErrorResponse("Label name must be 30 characters or less", 400),
    );
  }

  const label = await prisma.label.findFirst({
    where: {
      id: labelId,
      workspaceId,
    },
  });

  if (!label) {
    return next(new ErrorResponse("Label not found", 404));
  }

  if (trimmedName === undefined && color === undefined) {
    return next(new ErrorResponse("No label changes provided", 400));
  }

  const updatedLabel = await prisma.label.update({
    where: {
      id: label.id,
    },
    data: {
      ...(trimmedName !== undefined ? { name: trimmedName } : {}),
      ...(color !== undefined
        ? {
            color:
              typeof color === "string" && color.trim() ? color.trim() : null,
          }
        : {}),
    },
  });

  return res.status(200).json({
    message: "Label updated successfully",
    label: updatedLabel,
  });
});

export const deleteWorkspaceLabel = asyncHandler(async (req, res, next) => {
  const { workspaceId, labelId } = req.params;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof labelId !== "string") {
    return next(new ErrorResponse("Label id is required", 400));
  }

  const label = await prisma.label.findFirst({
    where: {
      id: labelId,
      workspaceId,
    },
  });

  if (!label) {
    return next(new ErrorResponse("Label not found", 404));
  }

  const deletedLabel = await prisma.label.delete({
    where: {
      id: label.id,
    },
  });

  return res.status(200).json({
    message: "Label deleted successfully",
    label: {
      id: deletedLabel.id,
      name: deletedLabel.name,
    },
  });
});
