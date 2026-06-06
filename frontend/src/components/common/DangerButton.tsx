type DangerButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  disabled?: boolean;
};

export default function DangerButton({
  children,
  onClick,
  type = 'button',
  fullWidth = false,
  disabled = false,
}: DangerButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-red-50 ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {children}
    </button>
  );
}
