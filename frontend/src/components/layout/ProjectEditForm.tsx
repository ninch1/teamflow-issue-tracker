import PrimaryButton from '../common/PrimaryButton';

type ProjectEditFormProps = {
  editProjectInfo: { name: string; description: string };
  onEditProjectChange: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
    }>
  >;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export default function ProjectEditForm({
  editProjectInfo,
  onEditProjectChange,
  onSubmit,
}: ProjectEditFormProps) {
  return (
    <div className='mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <h2 className='mb-4 text-xl font-semibold text-slate-950'>
        Edit Project
      </h2>

      <form onSubmit={onSubmit} className='grid gap-3 md:grid-cols-2'>
        <input
          type='text'
          placeholder='Project name'
          value={editProjectInfo.name}
          onChange={(e) =>
            onEditProjectChange((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />

        <input
          type='text'
          placeholder='Optional description'
          value={editProjectInfo.description}
          onChange={(e) =>
            onEditProjectChange((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />

        <div className='md:col-span-2'>
          <PrimaryButton type='submit'>Save changes</PrimaryButton>
        </div>
      </form>
    </div>
  );
}
