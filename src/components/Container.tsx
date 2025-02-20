import clsx from "clsx";
import { HTMLProps, FC } from "react";

export const Container: FC<HTMLProps<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={clsx("mx-auto max-w-7xl px-4 sm:px-8", className)}
      {...props}
    />
  );
};
