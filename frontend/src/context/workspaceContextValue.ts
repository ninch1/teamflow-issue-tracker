import { createContext, useContext } from 'react';
import type { Member } from '../types/memberTypes';

export type WorkspaceContextValue = {
  members: Member[];
  currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER' | null;
  canManageWorkspace: boolean;
};

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(
  null,
);

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      'useWorkspaceContext must be used inside WorkspaceProvider',
    );
  }

  return context;
}
