type WorkspaceCardProps = {
  workspaceInfo: {
    id: string;
    name: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
};

export default function WorkspaceCard({ workspaceInfo }: WorkspaceCardProps) {
  return (
    <div className='flex flex-col  w-full max-w-xs rounded-xl border border-slate-200 bg-white hover:bg-slate-100 p-6 shadow-sm cursor-pointer'>
      <h1 className='font-semibold'>{workspaceInfo.name}</h1>
      <h2 className='mb-5 text-sm text-slate-500'>{workspaceInfo.id}</h2>
      <h1 className='font-medium'>{workspaceInfo.role}</h1>
    </div>
  );
}
