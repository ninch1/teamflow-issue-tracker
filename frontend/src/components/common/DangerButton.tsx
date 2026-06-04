type DangerButtonProps = {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  fullWidth?: boolean;
};

export default function DangerButton({
  children,
  type = 'button',
  onClick,
  fullWidth = false,
}: DangerButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {children}
    </button>
  );
}
