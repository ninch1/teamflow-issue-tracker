import DangerButton from './DangerButton';

type DangerZoneProps = {
  title?: string;
  message: string;
  buttonText: string;
  submittingText?: string;
  onDelete: () => void;
  fullWidth?: boolean;
  isSubmitting?: boolean;
};

export default function DangerZone({
  title = 'Danger Zone',
  message,
  buttonText,
  submittingText = 'Deleting...',
  onDelete,
  fullWidth = false,
  isSubmitting = false,
}: DangerZoneProps) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50 p-6 ${
        fullWidth ? 'w-full' : 'lg:w-80'
      }`}
    >
      <h2 className='mb-2 text-xl font-semibold text-red-700'>{title}</h2>

      <p className='mb-4 text-sm text-red-600'>{message}</p>

      <DangerButton onClick={onDelete} disabled={isSubmitting}>
        {isSubmitting ? submittingText : buttonText}
      </DangerButton>
    </div>
  );
}
