import type { Label, IssueLabel } from '../../types/labelTypes';

type IssueLabelsSectionProps = {
  labels: Label[];
  issueLabels: IssueLabel[];
  selectedLabelId: string;
  canManageWorkspace: boolean;
  isAddingLabel: boolean;
  isRemovingLabel: boolean;
  onSelectedLabelChange: (labelId: string) => void;
  onAddLabel: () => void;
  onRemoveLabel: (labelId: string) => void;
};

export default function IssueLabelsSection({
  labels,
  issueLabels,
  selectedLabelId,
  canManageWorkspace,
  isAddingLabel,
  isRemovingLabel,
  onSelectedLabelChange,
  onAddLabel,
  onRemoveLabel,
}: IssueLabelsSectionProps) {
  const attachedLabelIds = new Set(
    issueLabels.map((issueLabel) => issueLabel.labelId),
  );

  const availableLabels = labels.filter(
    (label) => !attachedLabelIds.has(label.id),
  );

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div>
        <h2 className='text-lg font-semibold text-slate-950'>Labels</h2>
        <p className='text-sm text-slate-500'>
          Categorize this issue with workspace labels.
        </p>
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        {issueLabels.length === 0 ? (
          <p className='text-sm text-slate-500'>No labels added yet.</p>
        ) : (
          issueLabels.map((issueLabel) => (
            <span
              key={issueLabel.labelId}
              className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700'
            >
              <span
                className='h-2.5 w-2.5 rounded-full'
                style={{
                  backgroundColor: issueLabel.label.color || '#94a3b8',
                }}
              />
              {issueLabel.label.name}

              {canManageWorkspace && (
                <button
                  type='button'
                  onClick={() => onRemoveLabel(issueLabel.labelId)}
                  disabled={isRemovingLabel}
                  className='text-xs text-slate-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60'
                  aria-label={`Remove ${issueLabel.label.name} label`}
                >
                  ×
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {canManageWorkspace && (
        <div className='mt-5 flex flex-col gap-3 sm:flex-row'>
          <select
            value={selectedLabelId}
            onChange={(e) => onSelectedLabelChange(e.target.value)}
            disabled={isAddingLabel || availableLabels.length === 0}
            className='min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 disabled:cursor-not-allowed disabled:opacity-60'
          >
            <option value=''>
              {availableLabels.length === 0
                ? 'No labels available'
                : 'Choose a label'}
            </option>

            {availableLabels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>

          <button
            type='button'
            onClick={onAddLabel}
            disabled={isAddingLabel || !selectedLabelId}
            className='rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60'
          >
            {isAddingLabel ? 'Adding...' : 'Add label'}
          </button>
        </div>
      )}
    </section>
  );
}