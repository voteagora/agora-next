import React from "react";
import Link from "next/link";

export const HeaderLink = ({
  className,
  children,
  href,
  target,
  isActive,
  testId,
}) => {
  const activeClass = isActive
    ? "bg-white text-inherit text-primary border border-line shadow-newDefault"
    : "text-tertiary";

  return (
    <Link
      href={href}
      target={target}
      className={`px-4 rounded-full text-sm sm:text-base h-[38px] content-center ${activeClass} ${className || ""}`}
      data-testid={testId}
    >
      {children}
    </Link>
  );
};
