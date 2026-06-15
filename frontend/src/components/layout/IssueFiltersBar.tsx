import type {
  IssueStatus,
  IssuePriority,
  IssueType,
} from "../../types/issueTypes";
import PrimaryButton from "../common/PrimaryButton";
import SearchInput from "../common/SearchInput";
import type { Label } from "../../types/labelTypes";

type IssueFiltersBarProps = {
  issueCountText: string;
  statusFilter: "ALL" | IssueStatus;
  priorityFilter: "ALL" | IssuePriority;
  typeFilter: "ALL" | IssueType;
  hasActiveFilters: boolean;
  showCreateIssueForm: boolean;
  onStatusFilterChange: React.Dispatch<
    React.SetStateAction<IssueStatus | "ALL">
  >;
  onPriorityFilterChange: React.Dispatch<
    React.SetStateAction<"ALL" | IssuePriority>
  >;
  onTypeFilterChange: React.Dispatch<React.SetStateAction<"ALL" | IssueType>>;
  onResetFilters(): void;
  onShowCreateIssueForm: () => void;
  searchValue: string;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;
  labels: Label[];
  selectedLabelFilter: string;
  onLabelFilterChange: (labelId: string) => void;
};

export default function IssueFiltersBar({
  issueCountText,
  statusFilter,
  priorityFilter,
  typeFilter,
  hasActiveFilters,
  showCreateIssueForm,
  onStatusFilterChange,
  onPriorityFilterChange,
  onTypeFilterChange,
  onResetFilters,
  onShowCreateIssueForm,
  searchValue,
  onSearchChange,
  labels,
  selectedLabelFilter,
  onLabelFilterChange,
}: IssueFiltersBarProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-medium tracking-[-0.04em] text-slate-950">
          Issues
        </h2>
        <p className="text-sm text-slate-500">
          Track tasks, bugs, and feature work inside this project.{" "}
          {issueCountText}.
        </p>
      </div>

      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder="Search issues..."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
        <select
          value={statusFilter}
          onChange={(e) =>
            onStatusFilterChange(
              e.target.value as "ALL" | "TODO" | "IN_PROGRESS" | "DONE",
            )
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 lg:w-auto"
        >
          <option value="ALL">All statuses</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            onPriorityFilterChange(
              e.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH",
            )
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 lg:w-auto"
        >
          <option value="ALL">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) =>
            onTypeFilterChange(
              e.target.value as "ALL" | "BUG" | "FEATURE" | "TASK",
            )
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 lg:w-auto"
        >
          <option value="ALL">All types</option>
          <option value="BUG">Bug</option>
          <option value="FEATURE">Feature</option>
          <option value="TASK">Task</option>
        </select>

        <select
          value={selectedLabelFilter}
          onChange={(e) => onLabelFilterChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20"
        >
          <option value="">All labels</option>

          {labels.map((label) => (
            <option key={label.id} value={label.id}>
              {label.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 lg:w-auto"
          >
            Reset filters
          </button>
        )}

        {!showCreateIssueForm && (
          <div className="sm:col-span-2 lg:col-span-1">
            <PrimaryButton onClick={onShowCreateIssueForm} fullWidth>
              Create issue
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
