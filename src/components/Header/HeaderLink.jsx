import React from "react";
import Link from "next/link";

export const HeaderLink = ({ className, children, href, target, isActive }) => {
  const activeClass = isActive
    ? "bg-tertiary/20 text-inherit text-primary"
    : "text-secondary";

  return (
    <Link
      href={href}
      target={target}
      className={`py-1 px-4 rounded-full text-sm sm:text-base ${activeClass} ${className || ""}`}
    >
      {children}
    </Link>
  );
};
