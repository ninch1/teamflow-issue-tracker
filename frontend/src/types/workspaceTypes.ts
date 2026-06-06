export type Workspace = {
  id: string;
  name: string;
  description: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
  updatedAt: string;
};

export type EditWorkspaceInfo = {
  name: string;
  description: string;
};
