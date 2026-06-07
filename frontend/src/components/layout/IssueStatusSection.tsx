import PrimaryButton from '../common/PrimaryButton';
import type { IssueStatus } from '../../types/issueTypes';

type IssueStatusSectionProps = {
  status: IssueStatus;
  onStatusChange: React.Dispatch<React.SetStateAction<IssueStatus>>;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
};

export default function IssueStatusSection({
  status,
  onStatusChange,
  onSubmit,
  isSubmitting,
}: IssueStatusSectionProps) {
  return (
    <div className='w-full rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-950 shadow-sm lg:w-80'>
      <h2 className='text-xl font-semibold'>Update Status</h2>

      <p className='mb-4 mt-1 text-sm text-slate-500'>
        Move this issue through your workflow.
      </p>

      <div className='flex flex-col gap-3'>
        <select
          value={status}
          disabled={isSubmitting}
          onChange={(e) => onStatusChange(e.target.value as IssueStatus)}
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20 disabled:cursor-not-allowed disabled:opacity-60'
        >
          <option value='TODO'>TODO</option>
          <option value='IN_PROGRESS'>In Progress</option>
          <option value='DONE'>DONE</option>
        </select>

        <PrimaryButton onClick={onSubmit} disabled={isSubmitting} fullWidth>
          {isSubmitting ? 'Updating...' : 'Update status'}
        </PrimaryButton>
      </div>
    </div>
  );
}
