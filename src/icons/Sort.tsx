const SortIcon = ({
  fill,
  classname,
}: {
  fill?: string;
  classname?: string;
}) => {
  return (
    <svg
      className={classname}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.66667 13.3327V2.66602M4.66667 2.66602L2 5.33268M4.66667 2.66602L7.33333 5.33268"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.6673 5.99967L10.6673 13.333M10.6673 13.333L13.334 10.6663M10.6673 13.333L8.00065 10.6663"
        stroke={fill}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export { SortIcon };
export default SortIcon;
