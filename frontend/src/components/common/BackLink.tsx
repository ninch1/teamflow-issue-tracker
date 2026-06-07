import { Link } from 'react-router-dom';

type BackLinkProps = {
  to: string;
  children: React.ReactNode;
};

export default function BackLink({ to, children }: BackLinkProps) {
  return (
    <Link
      to={to}
      className='mb-4 inline-block text-sm font-medium text-[#5e6ad2] hover:text-[#4f5cc8]'
    >
      ← {children}
    </Link>
  );
}
