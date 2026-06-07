import type {
  IssueStatus,
  IssuePriority,
  IssueType,
} from '../../types/issueTypes';
import PrimaryButton from '../common/PrimaryButton';
import SearchInput from '../common/SearchInput';

type IssueFiltersBarProps = {
  issueCountText: string;
  statusFilter: 'ALL' | IssueStatus;
  priorityFilter: 'ALL' | IssuePriority;
  typeFilter: 'ALL' | IssueType;
  hasActiveFilters: boolean;
  showCreateIssueForm: boolean;
  onStatusFilterChange: React.Dispatch<
    React.SetStateAction<IssueStatus | 'ALL'>
  >;
  onPriorityFilterChange: React.Dispatch<
    React.SetStateAction<'ALL' | IssuePriority>
  >;
  onTypeFilterChange: React.Dispatch<React.SetStateAction<'ALL' | IssueType>>;
  onResetFilters(): void;
  onShowCreateIssueForm: () => void;
  searchValue: string;
  onSearchChange: React.Dispatch<React.SetStateAction<string>>;
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
}: IssueFiltersBarProps) {
  return (
    <div>
      <div className='mb-5 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-medium tracking-[-0.04em] text-slate-950'>
            Issues
          </h2>
          <p className='pr-5 text-sm text-slate-500'>
            Track tasks, bugs, and feature work inside this project.{' '}
            {issueCountText}.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          <select
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(
                e.target.value as 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE',
              )
            }
            className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
          >
            <option value='ALL'>All statuses</option>
            <option value='TODO'>Todo</option>
            <option value='IN_PROGRESS'>In Progress</option>
            <option value='DONE'>Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) =>
              onPriorityFilterChange(
                e.target.value as 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH',
              )
            }
            className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
          >
            <option value='ALL'>All priorities</option>
            <option value='LOW'>Low</option>
            <option value='MEDIUM'>Medium</option>
            <option value='HIGH'>High</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) =>
              onTypeFilterChange(
                e.target.value as 'ALL' | 'BUG' | 'FEATURE' | 'TASK',
              )
            }
            className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
          >
            <option value='ALL'>All types</option>
            <option value='BUG'>Bug</option>
            <option value='FEATURE'>Feature</option>
            <option value='TASK'>Task</option>
          </select>

          {hasActiveFilters && (
            <button
              type='button'
              onClick={onResetFilters}
              className='rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'
            >
              Reset filters
            </button>
          )}

          {!showCreateIssueForm && (
            <PrimaryButton onClick={onShowCreateIssueForm}>
              Create issue
            </PrimaryButton>
          )}
        </div>
      </div>

      <SearchInput value={searchValue} onChange={onSearchChange} />
    </div>
  );
}
