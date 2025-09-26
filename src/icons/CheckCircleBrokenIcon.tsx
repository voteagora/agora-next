export const CheckCircleBrokenIcon = ({
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
        d="M21 10.5857V11.5057C20.9988 13.6621 20.3005 15.7604 19.0093 17.4875C17.7182 19.2147 15.9033 20.4782 13.8354 21.0896C11.7674 21.701 9.55726 21.6276 7.53447 20.8803C5.51168 20.133 3.78465 18.7518 2.61096 16.9428C1.43727 15.1338 0.879791 12.9938 1.02168 10.842C1.16356 8.69029 1.99721 6.64205 3.39828 5.0028C4.79935 3.36354 6.69279 2.22111 8.79619 1.74587C10.8996 1.27063 13.1003 1.48806 15.07 2.36572M21 3.5L11 13.51L8 10.51"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
