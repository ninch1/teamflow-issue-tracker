type ErrorAlertProps = {
  message: string;
  onClose: () => void;
};

export default function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div className='mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>
      <p className='min-w-0 flex-1 break-words'>{message}</p>

      <button
        type='button'
        onClick={onClose}
        className='cursor-pointer rounded px-2 text-red-500 hover:bg-red-100 hover:text-red-700'
      >
        X
      </button>
    </div>
  );
}
