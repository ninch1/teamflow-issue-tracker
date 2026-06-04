import PrimaryButton from '../common/PrimaryButton';

type CreateIssueCardProps = {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'BUG' | 'FEATURE' | 'TASK';
  onPriorityChange: (value: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onTypeChange: (value: 'BUG' | 'FEATURE' | 'TASK') => void;
};

export default function CreateIssueCard({
  title,
  description,
  priority,
  type,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onTypeChange,
  onSubmit,
  onCancel,
}: CreateIssueCardProps) {
  return (
    <div className='flex w-full flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='flex flex-col gap-1'>
        <h3 className='font-semibold text-slate-950'>Add New Issue</h3>
        <p className='text-sm text-slate-500'>Create a new issue.</p>
      </div>

      <form onSubmit={onSubmit} className='flex flex-col gap-3'>
        <input
          type='text'
          placeholder='Fix login bug'
          onChange={(e) => onTitleChange(e.target.value)}
          value={title}
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />

        <input
          type='text'
          placeholder='Optional description'
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />

        <select
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
          value={priority}
          onChange={(e) =>
            onPriorityChange(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
          }
        >
          <option value='LOW'>Low</option>
          <option value='MEDIUM'>Medium</option>
          <option value='HIGH'>High</option>
        </select>

        <select
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
          value={type}
          onChange={(e) =>
            onTypeChange(e.target.value as 'BUG' | 'FEATURE' | 'TASK')
          }
        >
          <option value='BUG'>Bug</option>
          <option value='FEATURE'>Feature</option>
          <option value='TASK'>Task</option>
        </select>

        <div className='flex gap-2'>
          <PrimaryButton type='submit' fullWidth>
            Create
          </PrimaryButton>

          <button
            type='button'
            onClick={onCancel}
            className='flex-1 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
