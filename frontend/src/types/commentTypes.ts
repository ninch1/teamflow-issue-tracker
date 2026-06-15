export type Comment = {
  id: string;
  body: string;
  issueId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export type CreateCommentPayload = {
  body: string;
};

export type UpdateCommentPayload = {
  body: string;
};
