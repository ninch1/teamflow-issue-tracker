import { Link } from 'react-router-dom';

type ProjectCardProps = {
  projectInfo: {
    id: string;
    name: string;
    description: string | null;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
  };
};

export default function ProjectCard({ projectInfo }: ProjectCardProps) {
  return (
    <Link
      to={`/workspaces/${projectInfo.workspaceId}/projects/${projectInfo.id}`}
      className='flex min-h-36 w-full cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300'
    >
      <div className='flex flex-col gap-1'>
        <h3 className='font-semibold text-slate-950'>{projectInfo.name}</h3>
        <p className='mb-5 line-clamp-2 text-sm text-slate-500'>
          {projectInfo.description || 'No description yet.'}
        </p>
      </div>
    </Link>
  );
}
