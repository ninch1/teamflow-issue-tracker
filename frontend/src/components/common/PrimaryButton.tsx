type PrimaryButtonProps = {
  children: React.ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  fullWidth?: boolean;
};

export default function PrimaryButton({
  children,
  type = 'button',
  onClick,
  fullWidth = false,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`cursor-pointer rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {children}
    </button>
  );
}
