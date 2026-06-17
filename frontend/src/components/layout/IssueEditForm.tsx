import PrimaryButton from '../common/PrimaryButton';
import type { EditIssueInfo } from '../../types/issueTypes';

type IssueEditFormProps = {
  editIssueInfo: EditIssueInfo;
  onEditIssueChange: React.Dispatch<React.SetStateAction<EditIssueInfo>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
};

export default function IssueEditForm({
  editIssueInfo,
  onEditIssueChange,
  onSubmit,
  isSubmitting,
}: IssueEditFormProps) {
  return (
    <div className='min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-1'>
      <h2 className='mb-4 text-xl font-semibold'>Edit Issue</h2>

      <form onSubmit={onSubmit} className='grid gap-3 md:grid-cols-2'>
        <input
          type='text'
          placeholder='Issue title'
          value={editIssueInfo.title}
          onChange={(e) =>
            onEditIssueChange((prev) => ({ ...prev, title: e.target.value }))
          }
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />

        <input
          type='text'
          placeholder='Optional description'
          value={editIssueInfo.description}
          onChange={(e) =>
            onEditIssueChange((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />

        <select
          value={editIssueInfo.priority}
          onChange={(e) =>
            onEditIssueChange((prev) => ({
              ...prev,
              priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH',
            }))
          }
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        >
          <option value='LOW'>Low</option>
          <option value='MEDIUM'>Medium</option>
          <option value='HIGH'>High</option>
        </select>

        <select
          value={editIssueInfo.type}
          onChange={(e) =>
            onEditIssueChange((prev) => ({
              ...prev,
              type: e.target.value as 'BUG' | 'FEATURE' | 'TASK',
            }))
          }
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        >
          <option value='BUG'>Bug</option>
          <option value='FEATURE'>Feature</option>
          <option value='TASK'>Task</option>
        </select>

        <div className='md:col-span-2'>
          <PrimaryButton type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
