export const InfoIcon = ({
  className,
  fill,
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        aspectRatio: "16 / 16",
      }}
    >
      <g clipPath="url(#clip0_8777_3822)">
        <path
          d="M7.99992 10.6667V8.00004M7.99992 5.33337H8.00659M14.6666 8.00004C14.6666 11.6819 11.6818 14.6667 7.99992 14.6667C4.31802 14.6667 1.33325 11.6819 1.33325 8.00004C1.33325 4.31814 4.31802 1.33337 7.99992 1.33337C11.6818 1.33337 14.6666 4.31814 14.6666 8.00004Z"
          stroke={fill}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_8777_3822">
          <rect width="16" height="16" fill={fill} />
        </clipPath>
      </defs>
    </svg>
  );
};
