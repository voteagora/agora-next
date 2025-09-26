export const CoinsIcon = ({
  className,
  stroke,
}: {
  className?: string;
  stroke?: string;
}) => {
  return (
    <svg
      className={className}
      width="22"
      height="23"
      viewBox="0 0 22 23"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        aspectRatio: "22 / 23",
      }}
    >
      <path
        d="M9.10102 3.5C10.3636 2.26281 12.0927 1.5 14 1.5C17.866 1.5 21 4.63401 21 8.5C21 10.4073 20.2372 12.1365 18.9999 13.399M15 14.5C15 18.366 11.866 21.5 8 21.5C4.13401 21.5 1 18.366 1 14.5C1 10.634 4.13401 7.5 8 7.5C11.866 7.5 15 10.634 15 14.5Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
