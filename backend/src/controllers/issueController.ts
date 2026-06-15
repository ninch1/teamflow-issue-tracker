import prisma from "../lib/prisma";
import ErrorResponse from "../errors/ErrorResponse";
import asyncHandler from "../middleware/asyncHandler";
import { AuthRequest } from "../types/auth";
import {
  IssuePriority,
  IssueStatus,
  IssueType,
  ActivityType,
} from "../generated/prisma/client";
import {
  createActivity,
  formatIssuePriority,
  formatIssueStatus,
} from "../utils/createActivity";

// Allows issue titles with letters, numbers, spaces, and basic punctuation.
const issueTitleRegex = /^[A-Za-z0-9 _'.,!?-]{2,100}$/;

// Type guard: checks if request value is a valid IssueStatus enum value.
function isIssueStatus(value: unknown): value is IssueStatus {
  return (
    value === IssueStatus.TODO ||
    value === IssueStatus.IN_PROGRESS ||
    value === IssueStatus.DONE
  );
}

// Type guard: checks if request value is a valid IssuePriority enum value.
function isIssuePriority(value: unknown): value is IssuePriority {
  return (
    value === IssuePriority.LOW ||
    value === IssuePriority.MEDIUM ||
    value === IssuePriority.HIGH
  );
}

// Type guard: checks if request value is a valid IssueType enum value.
function isIssueType(value: unknown): value is IssueType {
  return (
    value === IssueType.BUG ||
    value === IssueType.TASK ||
    value === IssueType.FEATURE
  );
}

const assigneeInclude = {
  assignee: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
} as const;

function getMemberDisplayName(user: { name: string; email: string }) {
  return user.name || user.email;
}

async function getAssigneeDisplayName(
  workspaceId: string,
  memberId: string | null | undefined,
) {
  if (!memberId) {
    return null;
  }

  const member = await prisma.workspaceMember.findFirst({
    where: {
      id: memberId,
      workspaceId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!member) {
    return null;
  }

  return getMemberDisplayName(member.user);
}

// Create a new issue inside a project. OWNER and ADMIN only.
export const createIssue = asyncHandler(async (req, res, next) => {
  // Get authenticated user added by authMiddleware.
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  // Get workspace and project ids from nested route params.
  const workspaceId = req.params.workspaceId;
  const projectId = req.params.projectId;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof projectId !== "string") {
    return next(new ErrorResponse("Project id is required", 400));
  }

  if (!req.body) {
    return next(new ErrorResponse("Issue data is required", 400));
  }

  const { title, description, status, priority, type, assigneeId } = req.body;

  // Validate required issue title.
  if (typeof title !== "string") {
    return next(new ErrorResponse("Issue title is required", 400));
  }

  const trimmedTitle = title.trim();

  if (!issueTitleRegex.test(trimmedTitle)) {
    return next(
      new ErrorResponse(
        "Issue title must be 2-100 characters and can include letters, numbers, spaces, and basic punctuation",
        400,
      ),
    );
  }

  // Validate optional issue description.
  let trimmedDescription: string | undefined;

  if (description !== undefined) {
    if (typeof description !== "string") {
      return next(new ErrorResponse("Issue description must be a string", 400));
    }

    trimmedDescription = description.trim();

    if (trimmedDescription.length > 1000) {
      return next(
        new ErrorResponse(
          "Issue description must be 1000 characters or less",
          400,
        ),
      );
    }
  }

  // Set default issue values. Request body can override them if valid values are provided.
  let issueStatus: IssueStatus = IssueStatus.TODO;
  let issuePriority: IssuePriority = IssuePriority.MEDIUM;
  let issueType: IssueType = IssueType.TASK;

  if (status !== undefined) {
    if (!isIssueStatus(status)) {
      return next(new ErrorResponse("Invalid issue status", 400));
    }

    issueStatus = status;
  }

  if (priority !== undefined) {
    if (!isIssuePriority(priority)) {
      return next(new ErrorResponse("Invalid issue priority", 400));
    }

    issuePriority = priority;
  }

  if (type !== undefined) {
    if (!isIssueType(type)) {
      return next(new ErrorResponse("Invalid issue type", 400));
    }

    issueType = type;
  }

  if (assigneeId !== undefined) {
    if (assigneeId !== null && typeof assigneeId !== "string") {
      return next(
        new ErrorResponse("Assignee id must be a string or null", 400),
      );
    }

    if (assigneeId !== null) {
      const assignee = await prisma.workspaceMember.findFirst({
        where: {
          id: assigneeId,
          workspaceId,
        },
      });

      if (!assignee) {
        return next(new ErrorResponse("Assignee not found", 404));
      }
    }
  }

  // Make sure the project exists inside this workspace.
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
    },
  });

  if (!project) {
    return next(new ErrorResponse("Project not found", 404));
  }

  // Create issue inside the selected project.
  const issue = await prisma.issue.create({
    data: {
      title: trimmedTitle,
      description: trimmedDescription,
      status: issueStatus,
      priority: issuePriority,
      type: issueType,
      projectId: project.id,
      assigneeId: typeof assigneeId === "string" ? assigneeId : undefined,
    },
    include: assigneeInclude,
  });

  await createActivity({
    workspaceId,
    projectId: project.id,
    issueId: issue.id,
    userId: user.id,
    type: ActivityType.ISSUE_CREATED,
    message: `${user.name} created issue "${issue.title}"`,
  });

  if (typeof assigneeId === "string") {
    const assigneeName = await getAssigneeDisplayName(workspaceId, assigneeId);

    await createActivity({
      workspaceId,
      projectId: project.id,
      issueId: issue.id,
      userId: user.id,
      type: ActivityType.ISSUE_ASSIGNEE_CHANGED,
      message: `${user.name} assigned ${assigneeName} to issue "${issue.title}"`,
      oldValue: null,
      newValue: assigneeId,
    });
  }

  return res.status(201).json({
    message: "Issue created successfully",
    issue,
  });
});

// Get all issues inside a project.
export const getIssues = asyncHandler(async (req, res, next) => {
  const authReq = req as AuthRequest;
  const user = authReq.user;

  if (!user) {
    return next(new ErrorResponse("Unauthorized access", 401));
  }

  const workspaceId = req.params.workspaceId;
  const projectId = req.params.projectId;

  if (typeof workspaceId !== "string") {
    return next(new ErrorResponse("Workspace id is required", 400));
  }

  if (typeof projectId !== "string") {
    return next(new ErrorResponse("Project id is required", 400));
  }

  // Make sure the project exists inside this workspace.
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
    },
  });

  if (!project) {
    return next(new ErrorResponse("Project not found", 404));
  }

  const { status, priority, type, search } = req.query;

  if (search !== undefined && typeof search !== "string") {
    throw new ErrorResponse("Search must be string", 400);
  }
  let searchFilter: string = "";
  if (search) {
    searchFilter = search.trim();
  }

  let statusFilter: "TODO" | "IN_PROGRESS" | "DONE" | undefined;
  let priorityFilter: "LOW" | "MEDIUM" | "HIGH" | undefined;
  let typeFilter: "BUG" | "FEATURE" | "TASK" | undefined;

  if (status === "TODO" || status === "IN_PROGRESS" || status === "DONE") {
    statusFilter = status;
  }
  if (status !== undefined && !statusFilter) {
    throw new ErrorResponse("Please provide a valid status filter", 400);
  }

  if (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH") {
    priorityFilter = priority;
  }
  if (priority !== undefined && !priorityFilter) {
    throw new ErrorResponse("Please provide a valid priority filter", 400);
  }

  if (type === "BUG" || type === "FEATURE" || type === "TASK") {
    typeFilter = type;
  }
  if (type !== undefined && !typeFilter) {
    throw new ErrorResponse("Please provide a valid type filter", 400);
  }

  type queryType = {
    where: {
      projectId: string;
      status?: "TODO" | "IN_PROGRESS" | "DONE";
      priority?: "LOW" | "MEDIUM" | "HIGH";
      type?: "BUG" | "FEATURE" | "TASK";
      title?: {
        contains: string;
        mode: "insensitive";
      };
    };
    orderBy: {
      createdAt: "desc";
    };
  };

  let query: queryType = {
    where: {
      projectId: project.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  };

  if (searchFilter.length !== 0) {
    query.where.title = { contains: searchFilter, mode: "insensitive" };
  }
  if (statusFilter) {
    query.where.status = statusFilter;
  }
  if (priorityFilter) {
    query.where.priority = priorityFilter;
  }
  if (typeFilter) {
    query.where.type = typeFilter;
  }

  // Get issues newest first.
  const issues = await prisma.issue.findMany({
    where: query.where,
    orderBy: query.orderBy,
    include: assigneeInclude,
  });

  return res.status(200).json({
    message: "Issues returned successfully",
    issues,
  });
});

// Get one issue by id.
export const getIssue = asyncHandler(async (req, res, next) => {
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

  // Find issue only if it belongs to this project and workspace.
  const issue = await prisma.issue.findFirst({
    where: {
      id: issueId,
      projectId,
      project: {
        workspaceId,
      },
    },
    include: assigneeInclude,
  });

  if (!issue) {
    return next(new ErrorResponse("Issue not found", 404));
  }

  return res.status(200).json({
    message: "Issue returned successfully",
    issue,
  });
});

// Update issue. OWNER and ADMIN only.
export const updateIssue = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse("Issue update data is required", 400));
  }

  const { title, description, status, priority, type, assigneeId } = req.body;

  // Build update data only from fields provided in the request body.
  const dataToUpdate: {
    title?: string;
    description?: string | null;
    status?: IssueStatus;
    priority?: IssuePriority;
    type?: IssueType;
    assigneeId?: string | null;
  } = {};

  // Validate title only if user provided it.
  if (title !== undefined) {
    if (typeof title !== "string") {
      return next(new ErrorResponse("Issue title must be a string", 400));
    }

    const trimmedTitle = title.trim();

    if (!issueTitleRegex.test(trimmedTitle)) {
      return next(
        new ErrorResponse(
          "Issue title must be 2-100 characters and can include letters, numbers, spaces, and basic punctuation",
          400,
        ),
      );
    }

    dataToUpdate.title = trimmedTitle;
  }

  // Validate description only if user provided it.
  // null is allowed so the frontend can clear the description.
  if (description !== undefined) {
    if (description === null) {
      dataToUpdate.description = null;
    } else if (typeof description !== "string") {
      return next(new ErrorResponse("Issue description must be a string", 400));
    } else {
      const trimmedDescription = description.trim();

      if (trimmedDescription.length > 1000) {
        return next(
          new ErrorResponse(
            "Issue description must be 1000 characters or less",
            400,
          ),
        );
      }

      dataToUpdate.description = trimmedDescription;
    }
  }

  if (status !== undefined) {
    if (!isIssueStatus(status)) {
      return next(new ErrorResponse("Invalid issue status", 400));
    }

    dataToUpdate.status = status;
  }

  if (priority !== undefined) {
    if (!isIssuePriority(priority)) {
      return next(new ErrorResponse("Invalid issue priority", 400));
    }

    dataToUpdate.priority = priority;
  }

  if (type !== undefined) {
    if (!isIssueType(type)) {
      return next(new ErrorResponse("Invalid issue type", 400));
    }

    dataToUpdate.type = type;
  }

  if (assigneeId !== undefined) {
    if (assigneeId !== null && typeof assigneeId !== "string") {
      return next(
        new ErrorResponse("Assignee id must be a string or null", 400),
      );
    }

    if (assigneeId !== null) {
      const assignee = await prisma.workspaceMember.findFirst({
        where: {
          id: assigneeId,
          workspaceId,
        },
      });

      if (!assignee) {
        return next(new ErrorResponse("Assignee not found", 404));
      }
    }

    dataToUpdate.assigneeId = assigneeId;
  }

  // Prevent empty PATCH requests.
  if (Object.keys(dataToUpdate).length === 0) {
    return next(
      new ErrorResponse(
        "Please provide title, description, status, priority, type, or assigneeId to update",
        400,
      ),
    );
  }

  // Make sure the issue belongs to this project and workspace.
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

  // Update only the provided fields.
  const updatedIssue = await prisma.issue.update({
    where: {
      id: issue.id,
    },
    data: dataToUpdate,
    include: assigneeInclude,
  });

  // Create activity records for tracked issue changes.
  if (
    dataToUpdate.status !== undefined &&
    dataToUpdate.status !== issue.status
  ) {
    await createActivity({
      workspaceId,
      projectId,
      issueId,
      userId: user.id,
      type: ActivityType.ISSUE_STATUS_CHANGED,
      message: `${user.name} changed issue "${updatedIssue.title}" from ${formatIssueStatus(issue.status)} to ${formatIssueStatus(updatedIssue.status)}`,
      oldValue: issue.status,
      newValue: updatedIssue.status,
    });
  }

  if (
    dataToUpdate.priority !== undefined &&
    dataToUpdate.priority !== issue.priority
  ) {
    await createActivity({
      workspaceId,
      projectId,
      issueId,
      userId: user.id,
      type: ActivityType.ISSUE_PRIORITY_CHANGED,
      message: `${user.name} changed priority of issue "${updatedIssue.title}" from ${formatIssuePriority(issue.priority)} to ${formatIssuePriority(updatedIssue.priority)}`,
      oldValue: issue.priority,
      newValue: updatedIssue.priority,
    });
  }

  const titleChanged =
    dataToUpdate.title !== undefined && dataToUpdate.title !== issue.title;

  const descriptionChanged =
    dataToUpdate.description !== undefined &&
    (dataToUpdate.description ?? null) !== (issue.description ?? null);

  if (titleChanged || descriptionChanged) {
    let message = `${user.name} updated issue "${updatedIssue.title}"`;

    if (titleChanged && !descriptionChanged) {
      message = `${user.name} renamed issue from "${issue.title}" to "${updatedIssue.title}"`;
    } else if (!titleChanged && descriptionChanged) {
      message = `${user.name} updated the description of issue "${updatedIssue.title}"`;
    }

    await createActivity({
      workspaceId,
      projectId,
      issueId,
      userId: user.id,
      type: ActivityType.ISSUE_DETAILS_UPDATED,
      message,
      oldValue: titleChanged ? issue.title : issue.description,
      newValue: titleChanged ? updatedIssue.title : updatedIssue.description,
    });
  }

  const assigneeChanged =
    dataToUpdate.assigneeId !== undefined &&
    (dataToUpdate.assigneeId ?? null) !== (issue.assigneeId ?? null);

  if (assigneeChanged) {
    const [oldAssigneeName, newAssigneeName] = await Promise.all([
      getAssigneeDisplayName(workspaceId, issue.assigneeId),
      getAssigneeDisplayName(workspaceId, dataToUpdate.assigneeId),
    ]);

    let message = `${user.name} updated assignee for issue "${updatedIssue.title}"`;

    if (oldAssigneeName && newAssigneeName) {
      message = `${user.name} reassigned issue "${updatedIssue.title}" from ${oldAssigneeName} to ${newAssigneeName}`;
    } else if (newAssigneeName) {
      message = `${user.name} assigned ${newAssigneeName} to issue "${updatedIssue.title}"`;
    } else {
      message = `${user.name} unassigned issue "${updatedIssue.title}"`;
    }

    await createActivity({
      workspaceId,
      projectId,
      issueId,
      userId: user.id,
      type: ActivityType.ISSUE_ASSIGNEE_CHANGED,
      message,
      oldValue: issue.assigneeId,
      newValue: dataToUpdate.assigneeId ?? null,
    });
  }

  return res.status(200).json({
    message: "Issue updated successfully",
    issue: updatedIssue,
  });
});

// Delete issue. OWNER and ADMIN only.
export const deleteIssue = asyncHandler(async (req, res, next) => {
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

  // Make sure the issue belongs to this project and workspace before deleting.
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

  await createActivity({
    workspaceId,
    projectId,
    issueId: issue.id,
    userId: user.id,
    type: ActivityType.ISSUE_DELETED,
    message: `${user.name} deleted issue "${issue.title}"`,
  });

  const deletedIssue = await prisma.$transaction(async (tx) => {
    await tx.comment.deleteMany({
      where: {
        issueId: issue.id,
      },
    });

    const deletedIssue = await tx.issue.delete({
      where: {
        id: issue.id,
      },
    });

    return deletedIssue;
  });

  return res.status(200).json({
    message: "Issue deleted successfully",
    issue: {
      id: deletedIssue.id,
      title: deletedIssue.title,
    },
  });
});
