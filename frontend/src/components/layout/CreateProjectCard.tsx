import PrimaryButton from '../common/PrimaryButton';

type CreateProjectCardProps = {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function CreateProjectCard({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
}: CreateProjectCardProps) {
  return (
    <div className='flex w-full flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='flex flex-col gap-1'>
        <h3 className='font-semibold text-slate-950'>Add New Project</h3>
        <p className='text-sm text-slate-500'>Create a project.</p>
      </div>

      <form onSubmit={onSubmit} className='flex flex-col gap-3'>
        <input
          type='text'
          placeholder='Example Project'
          onChange={(e) => onNameChange(e.target.value)}
          value={name}
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />

        <input
          type='text'
          placeholder='Optional description'
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />

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
