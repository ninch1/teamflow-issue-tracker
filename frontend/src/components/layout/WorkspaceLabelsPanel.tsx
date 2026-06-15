import type { Label } from "../../types/labelTypes";

type WorkspaceLabelsPanelProps = {
  labels: Label[];
  canManageWorkspace: boolean;
  newLabelName: string;
  newLabelColor: string;
  editingLabelId: string | null;
  editingLabelName: string;
  editingLabelColor: string;
  isCreatingLabel: boolean;
  isUpdatingLabel: boolean;
  isDeletingLabel: boolean;
  onNewLabelNameChange: (name: string) => void;
  onNewLabelColorChange: (color: string) => void;
  onCreateLabel: () => void;
  onStartEditingLabel: (label: Label) => void;
  onCancelEditingLabel: () => void;
  onEditingLabelNameChange: (name: string) => void;
  onEditingLabelColorChange: (color: string) => void;
  onUpdateLabel: () => void;
  onDeleteLabel: (labelId: string) => void;
};

// TODO: fix success message spacing on top, and make it disappear after 3 seconds

export default function WorkspaceLabelsPanel({
  labels,
  canManageWorkspace,
  newLabelName,
  newLabelColor,
  editingLabelId,
  editingLabelName,
  editingLabelColor,
  isCreatingLabel,
  isUpdatingLabel,
  isDeletingLabel,
  onNewLabelNameChange,
  onNewLabelColorChange,
  onCreateLabel,
  onStartEditingLabel,
  onCancelEditingLabel,
  onEditingLabelNameChange,
  onEditingLabelColorChange,
  onUpdateLabel,
  onDeleteLabel,
}: WorkspaceLabelsPanelProps) {
  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Workspace labels
        </h2>
        <p className="text-sm text-slate-500">
          Create and manage labels that can be attached to issues.
        </p>
      </div>

      {!canManageWorkspace && (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
          Only workspace owners and admins can manage labels.
        </p>
      )}

      {canManageWorkspace && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-950">
            Create new label
          </h3>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => onNewLabelNameChange(e.target.value)}
              placeholder="Label name"
              disabled={isCreatingLabel}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => onNewLabelColorChange(e.target.value)}
              disabled={isCreatingLabel}
              className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-60 sm:w-16"
            />

            <button
              type="button"
              onClick={onCreateLabel}
              disabled={isCreatingLabel || !newLabelName.trim()}
              className="rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingLabel ? "Creating..." : "Create label"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {labels.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            No labels created yet.
          </p>
        ) : (
          labels.map((label) => {
            const isEditing = editingLabelId === label.id;

            return (
              <div
                key={label.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                {isEditing ? (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={editingLabelName}
                      onChange={(e) => onEditingLabelNameChange(e.target.value)}
                      disabled={isUpdatingLabel}
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <input
                      type="color"
                      value={editingLabelColor}
                      onChange={(e) =>
                        onEditingLabelColorChange(e.target.value)
                      }
                      disabled={isUpdatingLabel}
                      className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-60 sm:w-16"
                    />

                    <button
                      type="button"
                      onClick={onUpdateLabel}
                      disabled={isUpdatingLabel || !editingLabelName.trim()}
                      className="rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingLabel ? "Saving..." : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={onCancelEditingLabel}
                      disabled={isUpdatingLabel}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: label.color || "#94a3b8",
                        }}
                      />
                      <span className="truncate text-sm font-medium text-slate-700">
                        {label.name}
                      </span>
                    </div>

                    {canManageWorkspace && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => onStartEditingLabel(label)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-950"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteLabel(label.id)}
                          disabled={isDeletingLabel}
                          className="text-xs font-medium text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
