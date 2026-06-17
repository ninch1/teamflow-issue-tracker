import type { Workspace } from "../../types/workspaceTypes";

type WorkspaceDetailsCardProps = {
  workspace: Workspace;
  role?: string | null;
};

export default function WorkspaceDetailsCard({
  workspace,
  role,
}: WorkspaceDetailsCardProps) {
  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-sm text-slate-500">Workspace</p>

          <h1 className="break-words text-3xl font-semibold tracking-[-0.04em] text-slate-950">
            {workspace.name}
          </h1>

          <p className="mt-2 break-words text-sm text-slate-500">
            {workspace.description || "No description yet."}
          </p>
        </div>

        {role && (
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
            {role}
          </span>
        )}
      </div>
    </div>
  );
}
