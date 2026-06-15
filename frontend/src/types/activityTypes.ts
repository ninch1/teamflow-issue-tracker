export type ActivityType =
  | 'ISSUE_CREATED'
  | 'ISSUE_DETAILS_UPDATED'
  | 'ISSUE_STATUS_CHANGED'
  | 'ISSUE_PRIORITY_CHANGED'
  | 'ISSUE_ASSIGNEE_CHANGED'
  | 'COMMENT_ADDED'
  | 'ISSUE_DELETED'
  | 'ISSUE_ARCHIVED'
  | 'WORKSPACE_MEMBER_ADDED'
  | 'WORKSPACE_MEMBER_REMOVED';

export type Activity = {
  id: string;
  workspaceId: string;
  userId: string;
  type: ActivityType;
  message: string;
  issueId: string | null;
  projectId: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
};
