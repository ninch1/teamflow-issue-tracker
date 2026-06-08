import type { ReactNode } from 'react';
import {
  WorkspaceContext,
  type WorkspaceContextValue,
} from './workspaceContextValue';

type WorkspaceProviderProps = {
  children: ReactNode;
  value: WorkspaceContextValue;
};

export function WorkspaceProvider({ children, value }: WorkspaceProviderProps) {
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
