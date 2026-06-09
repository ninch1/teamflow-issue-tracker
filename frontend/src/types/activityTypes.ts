export type ActivityType = 'ISSUE_STATUS_CHANGED';

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
