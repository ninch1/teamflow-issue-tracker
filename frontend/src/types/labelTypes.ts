export type Label = {
  id: string;
  name: string;
  color: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

export type IssueLabel = {
  issueId: string;
  labelId: string;
  label: Label;
};

export type CreateLabelPayload = {
  name: string;
  color?: string | null;
};

export type UpdateLabelPayload = {
  name?: string;
  color?: string | null;
};
