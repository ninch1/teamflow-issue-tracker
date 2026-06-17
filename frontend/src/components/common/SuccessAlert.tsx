type SuccessAlertProps = {
  message: string;
  onClose: () => void;
};

export default function SuccessAlert({ message, onClose }: SuccessAlertProps) {
  return (
    <div className='mb-5 flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700'>
      <p className='min-w-0 flex-1 break-words'>{message}</p>

      <button
        type='button'
        onClick={onClose}
        className='cursor-pointer rounded px-2 text-green-600 hover:bg-green-100 hover:text-green-800'
      >
        X
      </button>
    </div>
  );
}
