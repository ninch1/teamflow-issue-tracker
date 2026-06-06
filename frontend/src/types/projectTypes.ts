export type Project = {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
};

export type EditProjectInfo = {
  name: string;
  description: string;
};
