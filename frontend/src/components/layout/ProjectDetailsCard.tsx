type ProjectDetailsCardProps = {
  project: {
    id: string;
    name: string;
    description: string | null;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
  };
};

export default function ProjectDetailsCard({
  project,
}: ProjectDetailsCardProps) {
  return (
    <div className='mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div>
        <p className='mb-2 text-sm text-slate-500'>Project</p>

        <h1 className='text-3xl font-semibold tracking-[-0.04em] text-slate-950'>
          {project.name}
        </h1>

        <p className='mt-2 text-sm text-slate-500'>
          {project.description || 'No description yet.'}
        </p>
      </div>
    </div>
  );
}
