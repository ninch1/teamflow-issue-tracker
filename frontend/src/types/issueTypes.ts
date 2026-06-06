export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type IssueType = 'BUG' | 'FEATURE' | 'TASK';

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
};

export type EditIssueInfo = {
  title: string;
  description: string;
  priority: IssuePriority;
  type: IssueType;
};
