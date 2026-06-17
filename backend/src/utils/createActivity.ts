import prisma from '../lib/prisma';
import {
  ActivityType,
  IssuePriority,
  IssueStatus,
} from '@prisma/client';

type CreateActivityInput = {
  workspaceId: string;
  userId: string;
  type: ActivityType;
  message: string;
  issueId?: string | null;
  projectId?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
};

export function formatIssueStatus(status: IssueStatus) {
  switch (status) {
    case IssueStatus.TODO:
      return 'Todo';
    case IssueStatus.IN_PROGRESS:
      return 'In Progress';
    case IssueStatus.DONE:
      return 'Done';
    default:
      return status;
  }
}

export function formatIssuePriority(priority: IssuePriority) {
  switch (priority) {
    case IssuePriority.LOW:
      return 'Low';
    case IssuePriority.MEDIUM:
      return 'Medium';
    case IssuePriority.HIGH:
      return 'High';
    default:
      return priority;
  }
}

export async function createActivity(data: CreateActivityInput) {
  return prisma.activity.create({
    data: {
      workspaceId: data.workspaceId,
      userId: data.userId,
      type: data.type,
      message: data.message,
      issueId: data.issueId ?? null,
      projectId: data.projectId ?? null,
      oldValue: data.oldValue ?? null,
      newValue: data.newValue ?? null,
    },
  });
}
