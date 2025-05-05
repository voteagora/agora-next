import React from "react";
import Link from "next/link";

export const HeaderLink = ({ className, children, href, target, isActive }) => {
  const activeClass = isActive
    ? "bg-primary text-inherit text-neutral"
    : "text-tertiary";

  return (
    <Link
      href={href}
      target={target}
      className={`px-4 rounded-full text-sm sm:text-base h-[40px] content-center ${activeClass} ${className || ""}`}
    >
      {children}
    </Link>
  );
};
