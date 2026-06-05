type LoadingCardProps = {
  message?: string;
};

export default function LoadingCard({
  message = 'Loading...',
}: LoadingCardProps) {
  return (
    <div className='w-full max-w-6xl rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm'>
      {message}
    </div>
  );
}
