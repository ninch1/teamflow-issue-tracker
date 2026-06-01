type AddWorkspaceCardProps = {
  onClick: () => void;
};

export default function AddWorkspaceCard({ onClick }: AddWorkspaceCardProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex min-h-36 w-full cursor-pointer flex-col justify-between rounded-xl border border-dashed border-slate-300 bg-white p-6 text-left shadow-sm hover:border-[#5e6ad2]'
    >
      <h3 className='font-semibold text-slate-950'>Add New Workspace</h3>
      <p className='text-sm text-slate-500'>Create a new workspace.</p>
    </button>
  );
}
