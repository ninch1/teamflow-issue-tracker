export type Invitation = {
  id: string;
  email: string;
  role: 'MEMBER' | 'OWNER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  workspace: {
    id: string;
    name: string;
  };
  invitedById: string;
  createdAt: string;
  updatedAt: string;
};
