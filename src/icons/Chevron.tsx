export const Chevron = ({
  className,
  onClick,
  dataTestId,
}: {
  className?: string;
  onClick?: () => void;
  dataTestId?: string;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      onClick={onClick}
      data-testid={dataTestId}
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="inherit"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
