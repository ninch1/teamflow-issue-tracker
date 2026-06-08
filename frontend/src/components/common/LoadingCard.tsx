type LoadingCardProps = {
  message?: string;
};

export default function LoadingCard({
  message = 'Loading...',
}: LoadingCardProps) {
  /* using mt-10 to match mb-4 of BackLink and p-6 of AppLayout */
  return (
    <div className='mt-10 w-full max-w-6xl rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm'>
      {message}
    </div>
  );
}
