type PrimaryButtonProps = {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({
  children,
  type = 'button',
  onClick,
  fullWidth = false,
  disabled,
}: PrimaryButtonProps) {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#5e6ad2] ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {children}
    </button>
  );
}
