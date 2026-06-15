import type { IssueLabel } from "./labelTypes";

export type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH";
export type IssueType = "BUG" | "FEATURE" | "TASK";

export type Issue = {
  id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  type: IssueType;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  assigneeId: string | null;
  assignee: {
    id: string;
    userId: string;
    workspaceId: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  } | null;
  labels: IssueLabel[];
};

export type EditIssueInfo = {
  title: string;
  description: string;
  priority: IssuePriority;
  type: IssueType;
};

export type UpdateIssuePayload = {
  title?: string;
  description?: string | null;
  status?: IssueStatus;
  priority?: IssuePriority;
  type?: IssueType;
  assigneeId?: string | null;
};
