export type Member = {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};
