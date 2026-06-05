import PrimaryButton from '../common/PrimaryButton';

type EditWorkspace = {
  name: string;
  description: string;
};

type WorkspaceEditFormProps = {
  editWorkspaceInfo: {
    name: string;
    description: string;
  };
  onEditWorkspaceChange: React.Dispatch<React.SetStateAction<EditWorkspace>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export default function WorkspaceEditForm({
  editWorkspaceInfo,
  onEditWorkspaceChange,
  onSubmit,
}: WorkspaceEditFormProps) {
  return (
    <div className='mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <h2 className='mb-4 text-xl font-semibold text-slate-950'>
        Edit Workspace
      </h2>

      <form onSubmit={onSubmit} className='grid gap-3 md:grid-cols-2'>
        <input
          type='text'
          placeholder='Workspace name'
          value={editWorkspaceInfo.name}
          onChange={(e) =>
            onEditWorkspaceChange((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:border-[#5e6ad2] focus:ring-2 focus:ring-[#5e69d1]/20'
        />

        <input
          type='text'
          placeholder='Optional description'
          value={editWorkspaceInfo.description}
          onChange={(e) =>
            onEditWorkspaceChange((prev) => ({
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
